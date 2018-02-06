const minimumReproductibilityRateToBeCertified = 50;
const minimumReproductibilityRateToBeTrusted = 80;
const numberOfPixForOneLevel = 8;
const _ = require('lodash');
const moment = require('moment');
const AnswerStatus = require('../models/AnswerStatus');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const { UserNotAuthorizedToCertifyError } = require('../../../lib/domain/errors');

const userService = require('../../../lib/domain/services/user-service');
const certificationChallengesService = require('../../../lib/domain/services/certification-challenges-service');
const answerServices = require('./answer-service');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const answersRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const certificationChallengesRepository = require('../../../lib/infrastructure/repositories/certification-challenge-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

function _enhanceAnswersWithCompetenceId(listAnswers, listChallenges) {
  return _.map(listAnswers, (answer) => {
    const competence = listChallenges.find((challenge) => challenge.challengeId === answer.get('challengeId'));

    answer.set('competenceId', competence.competenceId);
    return answer;
  });
}

function _numberOfCorrectAnswersPerCompetence(answersWithCompetences, competence) {
  return _(answersWithCompetences)
    .filter(answer => answer.get('competenceId') === competence.id)
    .filter(answer => AnswerStatus.isOK(answer.get('result')))
    .size();
}

function _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence, reproductibilityRate) {
  if (numberOfCorrectAnswers < 2) {
    return competence.pixScore;
  }
  if (reproductibilityRate < minimumReproductibilityRateToBeTrusted && numberOfCorrectAnswers === 2) {
    return numberOfPixForOneLevel;
  }
  return 0;
}

function _getCertifiedLevel(numberOfCorrectAnswers, competence, reproductibilityRate) {
  if (numberOfCorrectAnswers < 2) {
    return -1;
  }
  if (reproductibilityRate < minimumReproductibilityRateToBeTrusted && numberOfCorrectAnswers === 2) {
    return competence.estimatedLevel - 1;
  }
  return competence.estimatedLevel;
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('score').sum();
}

function _getCompetencesWithCertifiedLevelAndScore(answersWithCompetences, listCompetences, reproductibilityRate) {
  return listCompetences.map((competence) => {
    const numberOfCorrectAnswers = _numberOfCorrectAnswersPerCompetence(answersWithCompetences, competence);
    // TODO: Convertir ça en Mark ?
    return {
      name: competence.name,
      index: competence.index,
      id: competence.id,
      level: _getCertifiedLevel(numberOfCorrectAnswers, competence, reproductibilityRate),
      score: competence.pixScore - _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence,
        reproductibilityRate)
    };
  });
}

function _getCompetenceWithFailedLevel(listCompetences) {
  return listCompetences.map((competence) => {
    // TODO: Convertir ça en Mark ?
    return {
      name: competence.name,
      index: competence.index,
      id: competence.id,
      level: -1,
      score: 0
    };
  });
}

function _checkIfUserCanStartACertification(userCompetences) {
  const nbCompetencesWithEstimatedLevelHigherThan0 = userCompetences
    .filter(competence => competence.estimatedLevel > 0)
    .length;

  if(nbCompetencesWithEstimatedLevelHigherThan0 < 5)
    throw new UserNotAuthorizedToCertifyError();
}

function _getResult(listAnswers, listChallenges, listCompetences) {
  const reproductibilityRate = answerServices.getAnswersSuccessRate(listAnswers);
  if (reproductibilityRate < minimumReproductibilityRateToBeCertified) {
    return { listCertifiedCompetences: _getCompetenceWithFailedLevel(listCompetences), totalScore: 0 };
  }

  const answersWithCompetences = _enhanceAnswersWithCompetenceId(listAnswers, listChallenges);
  const listCertifiedCompetences = _getCompetencesWithCertifiedLevelAndScore(answersWithCompetences, listCompetences, reproductibilityRate);
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(listCertifiedCompetences);

  return { listCertifiedCompetences, totalScore: scoreAfterRating };
}

function _getCertificationResult(assessment) {
  let dateOfCertification;

  return Promise.all([assessment, answersRepository.findByAssessment(assessment.id)])
    .then(([assessment, answersByAssessments]) => {
      dateOfCertification = assessment.createdAt;
      return Promise.all([assessment, answersByAssessments, certificationChallengesRepository.findByCertificationCourseId(assessment.courseId)]);
    })
    .then(([assessment, answersByAssessments, certificationChallenges]) => {
      const userId = assessment.userId;

      return Promise.all([
        assessment,
        answersByAssessments,
        certificationChallenges,
        userService.getProfileToCertify(userId, dateOfCertification),
        certificationCourseRepository.get(assessment.courseId)
      ]);
    })
    .then(([assessment, listAnswers, listCertificationChallenges, listCompetences, certificationCourse]) => {
      const testedCompetences = listCompetences.filter(competence => competence.challenges.length > 0);

      const result = _getResult(listAnswers, listCertificationChallenges, testedCompetences);
      // FIXME: Missing tests
      result.createdAt = dateOfCertification;
      result.userId = assessment.userId;
      result.status = certificationCourse.status;
      return result;
    });
}

module.exports = {

  calculateCertificationResultByCertificationCourseId(certificationCourseId) {
    return assessmentRepository
      .getByCertificationCourseId(certificationCourseId)
      .then(_getCertificationResult);
  },

  calculateCertificationResultByAssessmentId(assessmentId) {
    return assessmentRepository
      .get(assessmentId)
      .then(_getCertificationResult);
  },

  startNewCertification(userId) {
    let userCompetencesToCertify;
    const newCertificationCourse = new CertificationCourse({ userId, status: 'started' });

    return userService.getProfileToCertify(userId, moment().toISOString())
      .then(userCompetences => {
        userCompetencesToCertify = userCompetences;
        return _checkIfUserCanStartACertification(userCompetences);
      })
      .then(() => certificationCourseRepository.save(newCertificationCourse))
      .then(savedCertificationCourse => certificationChallengesService.saveChallenges(userCompetencesToCertify, savedCertificationCourse));
  }
};
