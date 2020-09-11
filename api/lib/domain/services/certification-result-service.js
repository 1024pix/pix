const _ = require('lodash');
const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
  PIX_COUNT_BY_LEVEL,
  UNCERTIFIED_LEVEL,
} = require('../constants');
const AnswerStatus = require('../models/AnswerStatus');
const CertificationContract = require('../../domain/models/CertificationContract');
const scoringService = require('./scoring/scoring-service');
const { CertificationComputeError } = require('../../../lib/domain/errors');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const placementProfileService = require('./placement-profile-service');
const qrocmDepChallenge = 'QROCM-dep';

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

function _isQROCMdepOk(challenge, answer) {
  const challengeType = challenge ? challenge.type : '';
  return challengeType === qrocmDepChallenge && answer.isOk(); // TODO check challengeType in real Challenge Domain Object
}

function _isQROCMdepPartially(challenge, answer) {
  const challengeType = challenge ? challenge.type : '';
  return challengeType === qrocmDepChallenge && answer.isPartially();
}

function _numberOfCorrectAnswersPerCompetence(answers, competence, certificationChallenges, continueOnError) {
  const challengesForCompetence = _.filter(certificationChallenges, { competenceId: competence.id });
  const answersForCompetence = _selectAnswersMatchingCertificationChallenges(answers, challengesForCompetence);

  if (!continueOnError) {
    CertificationContract.assertThatCompetenceHasEnoughChallenge(challengesForCompetence, competence.index);

    CertificationContract.assertThatCompetenceHasEnoughAnswers(answersForCompetence, competence.index);
  }

  let nbOfCorrectAnswers = 0;
  answersForCompetence.forEach((answer) => {
    const challenge = _.find(challengesForCompetence, { challengeId: answer.challengeId });

    if (!challenge && !continueOnError) {
      throw new CertificationComputeError('Problème de chargement du challenge ' + answer.challengeId);
    }

    const answerResult = answer.result;
    if (answersForCompetence.length < 3 && _isQROCMdepOk(challenge, answer)) {
      nbOfCorrectAnswers += 2;
    } else if (answersForCompetence.length < 3 && _isQROCMdepPartially(challenge, answer)) {
      nbOfCorrectAnswers++;
    } else if (AnswerStatus.isOK(answerResult)) {
      nbOfCorrectAnswers++;
    }
  });

  return nbOfCorrectAnswers;
}

function _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence, reproducibilityRate) {
  if (numberOfCorrectAnswers < 2) {
    return competence.pixScore;
  }
  if (reproducibilityRate < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED && numberOfCorrectAnswers === 2) {
    return PIX_COUNT_BY_LEVEL;
  }
  return 0;
}

function _getCertifiedLevel(numberOfCorrectAnswers, competence, reproducibilityRate) {
  if (numberOfCorrectAnswers < 2) {
    return UNCERTIFIED_LEVEL;
  }
  if (reproducibilityRate < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED && numberOfCorrectAnswers === 2) {
    return scoringService.getBlockedLevel(competence.estimatedLevel - 1);
  }
  return scoringService.getBlockedLevel(competence.estimatedLevel);
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('obtainedScore').sum();
}

function _getCompetencesWithCertifiedLevelAndScore(answers, listCompetences, reproducibilityRate, certificationChallenges, continueOnError) {
  return listCompetences.map((competence) => {
    const numberOfCorrectAnswers = _numberOfCorrectAnswersPerCompetence(answers, competence, certificationChallenges, continueOnError);
    return {
      name: competence.name,
      index: competence.index,
      area_code: competence.area.code,
      id: competence.id,
      positionedLevel: scoringService.getBlockedLevel(competence.estimatedLevel),
      positionedScore: competence.pixScore,
      obtainedLevel: _getCertifiedLevel(numberOfCorrectAnswers, competence, reproducibilityRate),
      obtainedScore: competence.pixScore - _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence,
        reproducibilityRate),
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
      obtainedLevel: UNCERTIFIED_LEVEL,
      obtainedScore: 0,
    };
  });
}

function _getResult(answers, certificationChallenges, testedCompetences, continueOnError) {

  if (!continueOnError) {
    CertificationContract.assertThatWeHaveEnoughAnswers(answers, certificationChallenges);
  }

  const reproducibilityRate = Math.round(_computeAnswersSuccessRate(answers));
  if (reproducibilityRate < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED) {
    return {
      competencesWithMark: _getCompetenceWithFailedLevel(testedCompetences),
      totalScore: 0,
      percentageCorrectAnswers: reproducibilityRate,
    };
  }

  const competencesWithMark = _getCompetencesWithCertifiedLevelAndScore(answers, testedCompetences, reproducibilityRate, certificationChallenges, continueOnError);
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competencesWithMark);

  if (!continueOnError) {
    CertificationContract.assertThatScoreIsCoherentWithReproducibilityRate(scoreAfterRating, reproducibilityRate);
  }

  return { competencesWithMark, totalScore: scoreAfterRating, percentageCorrectAnswers: reproducibilityRate };
}

function _getChallengeInformation(listAnswers, certificationChallenges, competences) {
  return listAnswers.map((answer) => {

    const certificationChallengeRelatedToAnswer = certificationChallenges.find(
      (certificationChallenge) => certificationChallenge.challengeId === answer.challengeId,
    ) || {};

    const competenceValidatedByCertifChallenge = competences.find((competence) => competence.id === certificationChallengeRelatedToAnswer.competenceId) || {};

    return {
      result: answer.result.status,
      value: answer.value,
      challengeId: answer.challengeId,
      competence: competenceValidatedByCertifChallenge.index || '',
      skill: certificationChallengeRelatedToAnswer.associatedSkillName || '',
    };
  });
}

async function _getTestedCompetences({ userId, limitDate, isV2Certification }) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate, isV2Certification });
  return _(placementProfile.userCompetences)
    .filter((uc) => uc.isCertifiable())
    .map((uc) => _.pick(uc, ['id', 'area', 'index', 'name', 'estimatedLevel', 'pixScore']))
    .value();
}

function _computeAnswersSuccessRate(answers = []) {
  const numberOfAnswers = answers.length;

  if (!numberOfAnswers) {
    return 0;
  }

  const numberOfValidAnswers = answers.filter((answer) => answer.isOk()).length;

  return (numberOfValidAnswers % 100 / numberOfAnswers) * 100;
}

module.exports = {
  async getCertificationResult({ certificationAssessment, continueOnError }) {
    const allPixCompetences = await competenceRepository.listPixCompetencesOnly();
    const allChallenges = await challengeRepository.findOperative();

    // userService.getPlacementProfile() + filter level > 0 => avec allCompetence (bug)
    const testedCompetences = await _getTestedCompetences({
      userId: certificationAssessment.userId,
      limitDate: certificationAssessment.createdAt,
      isV2Certification: certificationAssessment.isV2Certification,
    });

    // map sur challenges filtre sur competence Id - S'assurer qu'on ne travaille que sur les compétences certifiables
    const matchingCertificationChallenges = _selectChallengesMatchingCompetences(certificationAssessment.certificationChallenges, testedCompetences);

    // decoration des challenges en ajoutant le type
    matchingCertificationChallenges.forEach((certifChallenge) => {
      const challenge = _.find(allChallenges, { id: certifChallenge.challengeId });
      certifChallenge.type = challenge ? challenge.type : 'EmptyType';
    });

    // map sur challenges filtre sur challenge Id
    const matchingAnswers = _selectAnswersMatchingCertificationChallenges(certificationAssessment.certificationAnswersByDate, matchingCertificationChallenges);

    const result = _getResult(matchingAnswers, matchingCertificationChallenges, testedCompetences, continueOnError);

    result.createdAt = certificationAssessment.createdAt;
    result.userId = certificationAssessment.userId;
    result.status = certificationAssessment.state;
    result.completedAt = certificationAssessment.completedAt;

    result.listChallengesAndAnswers = _getChallengeInformation(matchingAnswers, certificationAssessment.certificationChallenges, allPixCompetences);
    return result;
  },

  _computeAnswersSuccessRate,
};
