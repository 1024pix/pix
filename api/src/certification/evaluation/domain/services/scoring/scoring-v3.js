/**
 * @typedef {import('../index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 * @typedef {import('../index.js').CertificationAssessmentHistoryRepository} CertificationAssessmentHistoryRepository
 * @typedef {import('../index.js').CertificationChallengeRepository} CertificationChallengeRepository
 * @typedef {import('../index.js').ScoringConfigurationRepository} ScoringConfigurationRepository
 * @typedef {import('../index.js').FlashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 * @typedef {import('../index.js').AnswerRepository} AnswerRepository
 * @typedef {import('../index.js').FlashAlgorithmService} FlashAlgorithmService
 * @typedef {import('../index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 */
import Debug from 'debug';

import CertificationCancelled from '../../../../../../src/shared/domain/events/CertificationCancelled.js';
import { config } from '../../../../../shared/config.js';
import { CompetenceMark } from '../../../../../shared/domain/models/index.js';
import { FlashAssessmentAlgorithm } from '../../../../flash-certification/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../../scoring/domain/models/CertificationAssessmentHistory.js';
import { CertificationAssessmentScoreV3 } from '../../../../scoring/domain/models/CertificationAssessmentScoreV3.js';
import { AssessmentResultFactory } from '../../../../scoring/domain/models/factories/AssessmentResultFactory.js';

const debugScoringForV3Certification = Debug('pix:certif:v3:scoring');

/**
 * @param {Object} params
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 * @param {CertificationAssessmentHistoryRepository} params.certificationAssessmentHistoryRepository
 * @param {CertificationChallengeRepository} params.certificationChallengeRepository
 * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
 * @param {FlashAlgorithmConfigurationRepository} params.flashAlgorithmConfigurationRepository
 * @param {AnswerRepository} params.answerRepository
 * @param {FlashAlgorithmService} params.flashAlgorithmService
 * @param {ChallengeRepository} params.challengeRepository
 * @param {ScoringDegradationService} params.scoringDegradationService
 */
export const handleV3CertificationScoring = async ({
  event,
  certificationAssessment,
  locale,
  answerRepository,
  assessmentResultRepository,
  certificationAssessmentHistoryRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  scoringDegradationService,
  scoringConfigurationRepository,
  dependencies,
}) => {
  const { certificationCourseId, id: assessmentId } = certificationAssessment;

  const candidateAnswers = await answerRepository.findByAssessment(assessmentId);
  debugScoringForV3Certification(`CandidateAnswers count: ${candidateAnswers.length}`);

  const toBeCancelled = event instanceof CertificationCancelled;

  const { allChallenges, askedChallengesWithoutLiveAlerts, challengeCalibrationsWithoutLiveAlerts } =
    await dependencies.findByCertificationCourseIdAndAssessmentId({
      certificationCourseId,
      assessmentId,
    });
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });

  const abortReason = certificationCourse.getAbortReason();

  const configuration = await flashAlgorithmConfigurationRepository.getMostRecentBeforeDate(
    certificationCourse.getStartDate(),
  );

  const algorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration,
  });

  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByDateAndLocale({
    locale,
    date: certificationCourse.getStartDate(),
  });

  const certificationAssessmentScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
    abortReason,
    algorithm,
    // The following spread operation prevents the original array to be mutated during the simulation
    // so that in can be used during the assessment result creation
    allAnswers: [...candidateAnswers],
    allChallenges,
    challenges: askedChallengesWithoutLiveAlerts,
    maxReachableLevelOnCertificationDate: certificationCourse.getMaxReachableLevelOnCertificationDate(),
    v3CertificationScoring,
    scoringDegradationService,
  });

  const assessmentResult = await _createV3AssessmentResult({
    toBeCancelled,
    allAnswers: candidateAnswers,
    certificationAssessment,
    certificationAssessmentScore,
    certificationCourse,
    juryId: event?.juryId,
  });

  // isCancelled will be removed
  if (_hasV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers: candidateAnswers, certificationCourse })) {
    certificationCourse.cancel();
  }

  const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
    algorithm,
    challenges: challengeCalibrationsWithoutLiveAlerts,
    allAnswers: candidateAnswers,
  });

  await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

  await _saveV3Result({
    assessmentResult,
    certificationCourseId,
    certificationAssessmentScore,
    assessmentResultRepository,
    competenceMarkRepository,
  });

  return certificationCourse;
};

function _createV3AssessmentResult({
  toBeCancelled,
  allAnswers,
  certificationAssessment,
  certificationAssessmentScore,
  certificationCourse,
  juryId,
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

  if (_shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, certificationCourse })) {
    return AssessmentResultFactory.buildLackOfAnswers({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      juryId,
    });
  }

  if (_hasV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse })) {
    return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
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

async function _saveV3Result({
  assessmentResult,
  certificationCourseId,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const newAssessmentResult = await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });

  for (const competenceMark of certificationAssessmentScore.competenceMarks) {
    const competenceMarkDomain = new CompetenceMark({
      ...competenceMark,
      assessmentResultId: newAssessmentResult.id,
    });
    await competenceMarkRepository.save(competenceMarkDomain);
  }
}

function _shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, certificationCourse }) {
  if (certificationCourse.isAbortReasonTechnical()) {
    return false;
  }
  return _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers });
}

function _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers }) {
  return allAnswers.length < config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
}

function _hasV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse }) {
  return (
    certificationCourse.isAbortReasonTechnical() && _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers })
  );
}
