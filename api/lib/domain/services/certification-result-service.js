const {
  MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED,
  MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED,
  PIX_COUNT_BY_LEVEL,
  UNCERTIFIED_LEVEL
} = require('../constants');

const qrocmDepChallenge = 'QROCM-dep';

const _ = require('lodash');

const AnswerStatus = require('../models/AnswerStatus');
const CertificationContract = require('../../domain/models/CertificationContract');

const { CertificationComputeError } = require('../../../lib/domain/errors');

const answersRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const certificationChallengesRepository = require('../../../lib/infrastructure/repositories/certification-challenge-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const userService = require('./user-service');

function _selectAnswersMatchingCertificationChallenges(answers, certificationChallenges) {
  return answers.filter(
    ({ challengeId }) => _.some(certificationChallenges, { challengeId })
  );
}

function _selectChallengesMatchingCompetences(certificationChallenges, testedCompetences) {
  return certificationChallenges.filter(
    ({ competenceId }) => _.some(testedCompetences, { id: competenceId })
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

function _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence, reproductibilityRate) {
  if (numberOfCorrectAnswers < 2) {
    return competence.pixScore;
  }
  if (reproductibilityRate < MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED && numberOfCorrectAnswers === 2) {
    return PIX_COUNT_BY_LEVEL;
  }
  return 0;
}

function _getCertifiedLevel(numberOfCorrectAnswers, competence, reproductibilityRate) {
  if (numberOfCorrectAnswers < 2) {
    return UNCERTIFIED_LEVEL;
  }
  if (reproductibilityRate < MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED && numberOfCorrectAnswers === 2) {
    return competence.estimatedLevel - 1;
  }
  return competence.estimatedLevel;
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('obtainedScore').sum();
}

function _getCompetencesWithCertifiedLevelAndScore(answers, listCompetences, reproductibilityRate, certificationChallenges, continueOnError) {
  return listCompetences.map((competence) => {
    const numberOfCorrectAnswers = _numberOfCorrectAnswersPerCompetence(answers, competence, certificationChallenges, continueOnError);
    return {
      name: competence.name,
      index: competence.index,
      area_code: competence.area.code,
      id: competence.id,
      positionedLevel: competence.estimatedLevel,
      positionedScore: competence.pixScore,
      obtainedLevel: _getCertifiedLevel(numberOfCorrectAnswers, competence, reproductibilityRate),
      obtainedScore: competence.pixScore - _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence,
        reproductibilityRate),
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

  const reproductibilityRate = Math.round(_computeAnswersSuccessRate(answers));
  if (reproductibilityRate < MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED) {
    return {
      competencesWithMark: _getCompetenceWithFailedLevel(testedCompetences),
      totalScore: 0,
      percentageCorrectAnswers: reproductibilityRate,
    };
  }

  const competencesWithMark = _getCompetencesWithCertifiedLevelAndScore(answers, testedCompetences, reproductibilityRate, certificationChallenges, continueOnError);
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competencesWithMark);

  if (!continueOnError) {
    CertificationContract.assertThatScoreIsCoherentWithReproductibilityRate(scoreAfterRating, reproductibilityRate);
  }

  return { competencesWithMark, totalScore: scoreAfterRating, percentageCorrectAnswers: reproductibilityRate };
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
  const certificationProfile = await userService.getCertificationProfile({ userId, limitDate, isV2Certification });
  return _(certificationProfile.userCompetences)
    .filter((uc) => uc.estimatedLevel > 0)
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

  async getCertificationResult(assessment, continueOnError = false) {
    const [
      assessmentAnswers,
      certificationChallenges,
      certificationCourse,
      allCompetences,
      allChallenges
    ] = await Promise.all([
      answersRepository.findByAssessment(assessment.id),
      certificationChallengesRepository.findByCertificationCourseId(assessment.courseId),
      certificationCourseRepository.get(assessment.courseId),
      competenceRepository.list(),
      challengeRepository.list(),
    ]);

    const testedCompetences = await _getTestedCompetences({
      userId: assessment.userId,
      limitDate: assessment.createdAt,
      isV2Certification: certificationCourse.isV2Certification,
    });

    const matchingCertificationChallenges = _selectChallengesMatchingCompetences(certificationChallenges, testedCompetences);

    matchingCertificationChallenges.forEach((certifChallenge) => {
      const challenge = _.find(allChallenges, { id: certifChallenge.challengeId });
      certifChallenge.type = challenge ? challenge.type : 'EmptyType';
    });

    const matchingAnswers = _selectAnswersMatchingCertificationChallenges(assessmentAnswers, matchingCertificationChallenges);

    const result = _getResult(matchingAnswers, matchingCertificationChallenges, testedCompetences, continueOnError);

    result.createdAt = assessment.createdAt;
    result.userId = assessment.userId;
    result.status = assessment.state;
    result.completedAt = certificationCourse.completedAt;

    result.listChallengesAndAnswers = _getChallengeInformation(matchingAnswers, certificationChallenges, allCompetences);
    return result;
  },
  
  _computeAnswersSuccessRate,
};
