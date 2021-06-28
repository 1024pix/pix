const _ = require('lodash');

const CertificationContract = require('../../domain/models/CertificationContract');
const scoringService = require('./scoring/scoring-service');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const placementProfileService = require('./placement-profile-service');
const { CertifiedLevel } = require('../models/CertifiedLevel');
const { CertifiedScore } = require('../models/CertifiedScore');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');

function _selectAnswersMatchingCertificationChallenges(answers, certificationChallenges) {
  return answers.filter(
    ({ challengeId }) => _.some(certificationChallenges, { challengeId }),
  );
}

function _selectChallengesMatchingCompetences(certificationChallenges, testedCompetences) {
  return certificationChallenges.filter(
    ({ competenceId }) => _.some(testedCompetences, { id: competenceId }),
  );
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('obtainedScore').sum();
}

function _getCompetencesWithCertifiedLevelAndScore(answers, listCompetences, reproducibilityRate, certificationChallenges, continueOnError, answerCollection) {
  return listCompetences.map((competence) => {
    const challengesForCompetence = _.filter(certificationChallenges, { competenceId: competence.id });
    const answersForCompetence = _selectAnswersMatchingCertificationChallenges(answers, challengesForCompetence);

    if (!continueOnError) {
      CertificationContract.assertThatCompetenceHasAtLeastOneChallenge(challengesForCompetence, competence.index);
      CertificationContract.assertThatCompetenceHasAtLeastOneAnswer(answersForCompetence, competence.index);
      CertificationContract.assertThatEveryAnswerHasMatchingChallenge(answersForCompetence, challengesForCompetence);
    }

    const certifiedLevel = CertifiedLevel.from({
      numberOfChallenges: answerCollection.numberOfChallengesForCompetence(competence.id),
      numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswersForCompetence(competence.id),
      numberOfNeutralizedAnswers: answerCollection.numberOfNeutralizedChallengesForCompetence(competence.id),
      estimatedLevel: competence.estimatedLevel,
      reproducibilityRate,
    });
    const certifiedScore = CertifiedScore.from({ certifiedLevel, estimatedScore: competence.pixScore });
    return {
      name: competence.name,
      index: competence.index,
      area_code: competence.area.code,
      id: competence.id,
      positionedLevel: scoringService.getBlockedLevel(competence.estimatedLevel),
      positionedScore: competence.pixScore,
      obtainedLevel: scoringService.getBlockedLevel(certifiedLevel.value),
      obtainedScore: certifiedScore.value,
    };
  });
}

function _getCompetenceWithFailedLevel(listCompetences) {
  return listCompetences.map((competence) => {
    return {
      name: competence.name,
      index: competence.index,
      area_code: competence.area.code,
      id: competence.id,
      positionedLevel: competence.estimatedLevel,
      positionedScore: competence.pixScore,
      obtainedLevel: CertifiedLevel.invalidate().value,
      obtainedScore: 0,
    };
  });
}

function _getResult(answers, certificationChallenges, testedCompetences, continueOnError) {

  if (!continueOnError) {
    CertificationContract.assertThatWeHaveEnoughAnswers(answers, certificationChallenges);
  }

  const answerCollection = AnswerCollectionForScoring.from({ answers, challenges: certificationChallenges });

  const reproducibilityRate = ReproducibilityRate.from({
    numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
    numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
  });

  if (!reproducibilityRate.isEnoughToBeCertified()) {
    return {
      competencesWithMark: _getCompetenceWithFailedLevel(testedCompetences),
      totalScore: 0,
      percentageCorrectAnswers: reproducibilityRate.value,
    };
  }

  const competencesWithMark = _getCompetencesWithCertifiedLevelAndScore(answers, testedCompetences, reproducibilityRate.value, certificationChallenges, continueOnError, answerCollection);
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competencesWithMark);

  if (!continueOnError) {
    CertificationContract.assertThatScoreIsCoherentWithReproducibilityRate(scoreAfterRating, reproducibilityRate.value);
  }

  return { competencesWithMark, totalScore: scoreAfterRating, percentageCorrectAnswers: reproducibilityRate.value };
}

async function _getTestedCompetences({ userId, limitDate, isV2Certification }) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate, isV2Certification });
  return _(placementProfile.userCompetences)
    .filter((uc) => uc.isCertifiable())
    .map((uc) => _.pick(uc, ['id', 'area', 'index', 'name', 'estimatedLevel', 'pixScore']))
    .value();
}

module.exports = {
  async getCertificationResult({ certificationAssessment, continueOnError }) {
    const result = {
      createdAt: certificationAssessment.createdAt,
      userId: certificationAssessment.userId,
      status: certificationAssessment.state,
      completedAt: certificationAssessment.completedAt,
    };

    const scoreAndLevels = await _getScoreAndLevels(certificationAssessment, continueOnError);
    result.competencesWithMark = scoreAndLevels.competencesWithMark;
    result.totalScore = scoreAndLevels.totalScore;
    result.percentageCorrectAnswers = scoreAndLevels.percentageCorrectAnswers;

    const challengeInformation = await _getChallengeInformation(certificationAssessment);
    result.listChallengesAndAnswers = challengeInformation;

    return result;
  },
};

async function _getScoreAndLevels(certificationAssessment, continueOnError) {
  // userService.getPlacementProfile() + filter level > 0 => avec allCompetence (bug)
  const testedCompetences = await _getTestedCompetences({
    userId: certificationAssessment.userId,
    limitDate: certificationAssessment.createdAt,
    isV2Certification: certificationAssessment.isV2Certification,
  });

  // map sur challenges filtre sur competence Id - S'assurer qu'on ne travaille que sur les compétences certifiables
  const matchingCertificationChallenges = _selectChallengesMatchingCompetences(certificationAssessment.certificationChallengesInTestOrder(), testedCompetences);

  // map sur challenges filtre sur challenge Id
  const matchingAnswers = _selectAnswersMatchingCertificationChallenges(certificationAssessment.certificationAnswersByDate, matchingCertificationChallenges);

  return _getResult(matchingAnswers, matchingCertificationChallenges, testedCompetences, continueOnError);
}

async function _getChallengeInformation(certificationAssessment) {
  // userService.getPlacementProfile() + filter level > 0 => avec allCompetence (bug)
  const testedCompetences = await _getTestedCompetences({
    userId: certificationAssessment.userId,
    limitDate: certificationAssessment.createdAt,
    isV2Certification: certificationAssessment.isV2Certification,
  });

  // map sur challenges filtre sur competence Id - S'assurer qu'on ne travaille que sur les compétences certifiables
  const matchingCertificationChallenges = _selectChallengesMatchingCompetences(certificationAssessment.certificationChallengesInTestOrder(), testedCompetences);

  // map sur challenges filtre sur challenge Id
  const matchingAnswers = _selectAnswersMatchingCertificationChallenges(certificationAssessment.certificationAnswersByDate, matchingCertificationChallenges);

  const allPixCompetences = await competenceRepository.listPixCompetencesOnly();
  return matchingAnswers.map((answer) => {

    const certificationChallengeRelatedToAnswer = certificationAssessment.certificationChallengesInTestOrder().find(
      (certificationChallenge) => certificationChallenge.challengeId === answer.challengeId,
    ) || {};

    const competenceValidatedByCertifChallenge = allPixCompetences.find((competence) => competence.id === certificationChallengeRelatedToAnswer.competenceId) || {};

    return {
      result: answer.result.status,
      value: answer.value,
      challengeId: answer.challengeId,
      isNeutralized: certificationChallengeRelatedToAnswer.isNeutralized,
      competence: competenceValidatedByCertifChallenge.index || '',
      skill: certificationChallengeRelatedToAnswer.associatedSkillName || '',
    };
  });
}
