import _ from 'lodash';

import { CertificationAssessmentScore } from '../../../../src/certification/scoring/domain/models/CertificationAssessmentScore.js';
import { CertificationVersion } from '../../../../src/certification/shared/domain/models/CertificationVersion.js';
import * as areaRepository from '../../../../src/shared/infrastructure/repositories/area-repository.js';
import {
  AnswerCollectionForScoring,
  CertificationContract,
  CertifiedLevel,
  CertifiedScore,
  CompetenceMark,
  ReproducibilityRate,
} from '../../models/index.js';
import * as placementProfileService from '../placement-profile-service.js';
import * as scoringService from './scoring-service.js';

const calculateCertificationAssessmentScore = async function ({
  certificationAssessment,
  continueOnError,
  dependencies = {
    areaRepository,
    placementProfileService,
  },
}) {
  const testedCompetences = await _getTestedCompetences({
    userId: certificationAssessment.userId,
    limitDate: certificationAssessment.createdAt,
    version: CertificationVersion.V2,
    placementProfileService: dependencies.placementProfileService,
  });

  const matchingCertificationChallenges = _selectChallengesMatchingCompetences(
    certificationAssessment.certificationChallenges,
    testedCompetences,
  );

  const matchingAnswers = _selectAnswersMatchingCertificationChallenges(
    certificationAssessment.certificationAnswersByDate,
    matchingCertificationChallenges,
  );

  const allAreas = await dependencies.areaRepository.list();
  return _getResult(matchingAnswers, matchingCertificationChallenges, testedCompetences, allAreas, continueOnError);
};

function isLackOfAnswersForTechnicalReason({ certificationCourse, certificationAssessmentScore }) {
  return certificationCourse.isAbortReasonTechnical() && certificationAssessmentScore.hasInsufficientCorrectAnswers();
}

export { calculateCertificationAssessmentScore, isLackOfAnswersForTechnicalReason };

function _selectAnswersMatchingCertificationChallenges(answers, certificationChallenges) {
  return answers.filter(({ challengeId }) => _.some(certificationChallenges, { challengeId }));
}

function _selectChallengesMatchingCompetences(certificationChallenges, testedCompetences) {
  return certificationChallenges.filter(({ competenceId }) => _.some(testedCompetences, { id: competenceId }));
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('obtainedScore').sum();
}

function _getCompetenceMarksWithCertifiedLevelAndScore(
  answers,
  listCompetences,
  reproducibilityRate,
  certificationChallenges,
  continueOnError,
  answerCollection,
  allAreas,
) {
  return listCompetences.map((competence) => {
    const challengesForCompetence = _.filter(certificationChallenges, { competenceId: competence.id });
    const answersForCompetence = _selectAnswersMatchingCertificationChallenges(answers, challengesForCompetence);

    if (!continueOnError) {
      CertificationContract.assertThatCompetenceHasAtLeastOneChallenge(challengesForCompetence, competence.index);
      CertificationContract.assertThatEveryAnswerHasMatchingChallenge(answersForCompetence, challengesForCompetence);
      CertificationContract.assertThatNoChallengeHasMoreThanOneAnswer(answersForCompetence, challengesForCompetence);
    }

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

function _getCompetenceMarksWithFailedLevel(listCompetences, allAreas) {
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

function _getResult(answers, certificationChallenges, testedCompetences, allAreas, continueOnError) {
  if (!continueOnError) {
    CertificationContract.assertThatWeHaveEnoughAnswers(answers, certificationChallenges);
  }

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
      competenceMarks: _getCompetenceMarksWithFailedLevel(testedCompetences, allAreas),
      percentageCorrectAnswers: reproducibilityRate.value,
      hasEnoughNonNeutralizedChallengesToBeTrusted,
    });
  }

  const competenceMarks = _getCompetenceMarksWithCertifiedLevelAndScore(
    answers,
    testedCompetences,
    reproducibilityRate.value,
    certificationChallenges,
    continueOnError,
    answerCollection,
    allAreas,
  );
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competenceMarks);

  if (!continueOnError) {
    CertificationContract.assertThatScoreIsCoherentWithReproducibilityRate(scoreAfterRating, reproducibilityRate.value);
  }

  return new CertificationAssessmentScore({
    competenceMarks,
    percentageCorrectAnswers: reproducibilityRate.value,
    hasEnoughNonNeutralizedChallengesToBeTrusted,
  });
}

async function _getTestedCompetences({ userId, limitDate, version, placementProfileService }) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate, version });
  return _(placementProfile.userCompetences)
    .filter((uc) => uc.isCertifiable())
    .map((uc) => _.pick(uc, ['id', 'index', 'areaId', 'name', 'estimatedLevel', 'pixScore']))
    .value();
}
