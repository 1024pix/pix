/**
 * @typedef {import('../index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 * @typedef {import('../index.js').ScoringCertificationService} ScoringCertificationService
 * @typedef {import('../index.js').ScoringService} ScoringService
 * @typedef {import('../index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import('../../../../session-management/domain/models/CertificationAssessment.js').CertificationAssessment} CertificationAssessment
 */

import _ from 'lodash';

import CertificationCancelled from '../../../../../../src/shared/domain/events/CertificationCancelled.js';
import {
  AnswerCollectionForScoring,
  CertificationAssessmentScore,
  CertificationContract,
  CertifiedLevel,
  CertifiedScore,
  CompetenceMark,
  ReproducibilityRate,
} from '../../../../../shared/domain/models/index.js';
import { AssessmentResultFactory } from '../../../../scoring/domain/models/factories/AssessmentResultFactory.js';
import { AlgorithmEngineVersion } from '../../../../shared/domain/models/AlgorithmEngineVersion.js';

/**
 * @param {Object} params
 * @param {{juryId: number}} params.[event]
 * @param {CertificationAssessment} params.certificationAssessment
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 * @param {ScoringCertificationService} params.scoringCertificationService
 * @param {AreaRepository} params.areaRepository
 * @param {PlacementProfileService} params.placementProfileService
 * @param {ScoringService} params.scoringService
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 * @param {Object} params.dependencies
 * @param {calculateCertificationAssessmentScore} params.dependencies.calculateCertificationAssessmentScore
 */
export const handleV2CertificationScoring = async ({
  event,
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  areaRepository,
  placementProfileService,
  scoringService,
  certificationCandidateRepository,
  dependencies = { calculateCertificationAssessmentScore },
}) => {
  const certificationAssessmentScore = await dependencies.calculateCertificationAssessmentScore({
    certificationAssessment,
    areaRepository,
    placementProfileService,
    scoringService,
    certificationCandidateRepository,
  });
  const certificationCourse = await certificationCourseRepository.get({
    id: certificationAssessment.certificationCourseId,
  });

  const toBeCancelled = event instanceof CertificationCancelled;

  const assessmentResult = _createV2AssessmentResult({
    juryId: event?.juryId,
    toBeCancelled,
    certificationCourse,
    certificationAssessment,
    certificationAssessmentScore,
    scoringCertificationService,
  });

  await _saveV2Result({
    assessmentResult,
    certificationCourseId: certificationAssessment.certificationCourseId,
    certificationAssessmentScore,
    assessmentResultRepository,
    competenceMarkRepository,
  });

  return { certificationCourse, certificationAssessmentScore };
};

/**
 * @param {Object} params
 * @param {CertificationAssessment} params.certificationAssessment
 * @param {ScoringService} params.scoringService
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 */
export const calculateCertificationAssessmentScore = async function ({
  certificationAssessment,
  areaRepository,
  placementProfileService,
  scoringService,
  certificationCandidateRepository,
}) {
  const candidate = await certificationCandidateRepository.findByAssessmentId({
    assessmentId: certificationAssessment.id,
  });

  const testedCompetences = await _getTestedCompetences({
    userId: certificationAssessment.userId,
    limitDate: candidate.reconciledAt,
    version: AlgorithmEngineVersion.V2,
    placementProfileService,
  });

  const matchingCertificationChallenges = _selectChallengesMatchingCompetences(
    certificationAssessment.certificationChallenges,
    testedCompetences,
  );

  const matchingAnswers = _selectAnswersMatchingCertificationChallenges(
    certificationAssessment.certificationAnswersByDate,
    matchingCertificationChallenges,
  );

  const allAreas = await areaRepository.list();
  return _getResult(matchingAnswers, matchingCertificationChallenges, testedCompetences, allAreas, scoringService);
};

/**
 * @param {Object} params
 * @param {PlacementProfileService} params.placementProfileService
 */
async function _getTestedCompetences({ userId, limitDate, version, placementProfileService }) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate, version });
  return _(placementProfile.userCompetences)
    .filter((uc) => uc.isCertifiable())
    .map((uc) => _.pick(uc, ['id', 'index', 'areaId', 'name', 'estimatedLevel', 'pixScore']))
    .value();
}

function _selectAnswersMatchingCertificationChallenges(answers, certificationChallenges) {
  return answers.filter(({ challengeId }) => _.some(certificationChallenges, { challengeId }));
}

function _selectChallengesMatchingCompetences(certificationChallenges, testedCompetences) {
  return certificationChallenges.filter(({ competenceId }) => _.some(testedCompetences, { id: competenceId }));
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('obtainedScore').sum();
}

/**
 * @param {ScoringService} scoringService
 */
function _getCompetenceMarksWithCertifiedLevelAndScore(
  answers,
  listCompetences,
  reproducibilityRate,
  certificationChallenges,
  answerCollection,
  allAreas,
  scoringService,
) {
  return listCompetences.map((competence) => {
    const challengesForCompetence = _.filter(certificationChallenges, { competenceId: competence.id });
    const answersForCompetence = _selectAnswersMatchingCertificationChallenges(answers, challengesForCompetence);

    CertificationContract.assertThatCompetenceHasAtLeastOneChallenge(challengesForCompetence, competence.index);
    CertificationContract.assertThatEveryAnswerHasMatchingChallenge(answersForCompetence, challengesForCompetence);
    CertificationContract.assertThatNoChallengeHasMoreThanOneAnswer(answersForCompetence, challengesForCompetence);

    const certifiedLevel = CertifiedLevel.from({
      numberOfChallenges: answerCollection.numberOfChallengesForCompetence(competence.id),
      numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswersForCompetence(competence.id),
      numberOfNeutralizedAnswers: answerCollection.numberOfNeutralizedChallengesForCompetence(competence.id),
      estimatedLevel: competence.estimatedLevel,
      reproducibilityRate,
    });
    const certifiedScore = CertifiedScore.from({ certifiedLevel, estimatedScore: competence.pixScore });
    const area = allAreas.find((area) => area.id === competence.areaId);
    return new CompetenceMark({
      level: scoringService.getBlockedLevel(certifiedLevel.value),
      score: scoringService.getBlockedPixScore(certifiedScore.value),
      area_code: area.code,
      competence_code: competence.index,
      competenceId: competence.id,
    });
  });
}

/**
 * @param {ScoringService} scoringService
 */
function _getCompetenceMarksWithFailedLevel(listCompetences, allAreas, scoringService) {
  return listCompetences.map((competence) => {
    const area = allAreas.find((area) => area.id === competence.areaId);
    return new CompetenceMark({
      level: scoringService.getBlockedLevel(CertifiedLevel.invalidate().value),
      score: scoringService.getBlockedPixScore(0),
      area_code: area.code,
      competence_code: competence.index,
      competenceId: competence.id,
    });
  });
}

/**
 * @param {ScoringService} scoringService
 */
function _getResult(answers, certificationChallenges, testedCompetences, allAreas, scoringService) {
  CertificationContract.assertThatWeHaveEnoughAnswers(answers, certificationChallenges);

  const answerCollection = AnswerCollectionForScoring.from({ answers, challenges: certificationChallenges });

  const reproducibilityRate = ReproducibilityRate.from({
    numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
    numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
  });

  const hasEnoughNonNeutralizedChallengesToBeTrusted =
    CertificationContract.hasEnoughNonNeutralizedChallengesToBeTrusted(
      answerCollection.numberOfChallenges(),
      answerCollection.numberOfNonNeutralizedChallenges(),
    );

  if (!reproducibilityRate.isEnoughToBeCertified()) {
    return new CertificationAssessmentScore({
      competenceMarks: _getCompetenceMarksWithFailedLevel(testedCompetences, allAreas, scoringService),
      percentageCorrectAnswers: reproducibilityRate.value,
      hasEnoughNonNeutralizedChallengesToBeTrusted,
    });
  }

  const competenceMarks = _getCompetenceMarksWithCertifiedLevelAndScore(
    answers,
    testedCompetences,
    reproducibilityRate.value,
    certificationChallenges,
    answerCollection,
    allAreas,
    scoringService,
  );
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competenceMarks);

  CertificationContract.assertThatScoreIsCoherentWithReproducibilityRate(scoreAfterRating, reproducibilityRate.value);

  return new CertificationAssessmentScore({
    competenceMarks,
    percentageCorrectAnswers: reproducibilityRate.value,
    hasEnoughNonNeutralizedChallengesToBeTrusted,
  });
}

/**
 * @param {Object} params
 * @param {CertificationAssessment} params.certificationAssessment
 * @param {ScoringCertificationService} params.scoringCertificationService
 */
function _createV2AssessmentResult({
  juryId,
  toBeCancelled,
  certificationCourse,
  certificationAssessmentScore,
  certificationAssessment,
  scoringCertificationService,
}) {
  if (toBeCancelled) {
    return AssessmentResultFactory.buildCancelledAssessmentResult({
      juryId,
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
    });
  }

  if (certificationCourse.isRejectedForFraud()) {
    return AssessmentResultFactory.buildFraud({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId,
    });
  }

  if (!certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted) {
    return AssessmentResultFactory.buildNotTrustableAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId,
    });
  }

  if (
    scoringCertificationService.isLackOfAnswersForTechnicalReason({ certificationAssessmentScore, certificationCourse })
  ) {
    return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId,
    });
  }

  if (certificationAssessmentScore.hasInsufficientCorrectAnswers()) {
    return AssessmentResultFactory.buildInsufficientCorrectAnswers({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    juryId,
  });
}

/**
 * @param {Object} params
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 */
async function _saveV2Result({
  assessmentResult,
  certificationCourseId,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const { id: assessmentResultId } = await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });

  for (const competenceMark of certificationAssessmentScore.competenceMarks) {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, assessmentResultId });
    await competenceMarkRepository.save(competenceMarkDomain);
  }
}
