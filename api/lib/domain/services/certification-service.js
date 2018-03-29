const minimumReproductibilityRateToBeCertified = 50;
const minimumReproductibilityRateToBeTrusted = 80;
const numberOfPixForOneLevel = 8;
const uncertifiedLevel = -1;
const qrocmDepChallenge = 'QROCM-dep';
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
const competenceRepository = require('../../infrastructure/repositories/competence-repository');

function _enhanceAnswersWithCompetenceId(listAnswers, listChallenges) {
  return _.map(listAnswers, (answer) => {
    const competence = listChallenges.find((challenge) => challenge.challengeId === answer.challengeId);

    answer.competenceId = competence.competenceId;
    return answer;
  });
}

function _isQROCMdepOk(challenge, answer) {
  const challengeType = challenge ? challenge.type : '';
  return challengeType === qrocmDepChallenge && answer.isOk(); // TODO check challengeType in real Challenge Domain Object
}

function _isQROCMdepPartially(challenge, answer) {
  const challengeType = challenge ? challenge.type : '';
  return challengeType === qrocmDepChallenge && answer.isPartially();
}

function _numberOfCorrectAnswersPerCompetence(answersWithCompetences, competence) {
  const answerForCompetence = _.filter(answersWithCompetences, answer => answer.competenceId === competence.id);

  let nbOfCorrectAnswers = 0;
  answerForCompetence.forEach(answer => {
    const challenge = _.find(competence.challenges, challenge => challenge.id === answer.challengeId);
    const answerResult = answer.result;

    if (competence.challenges.length < 3 && _isQROCMdepOk(challenge, answer)) {
      nbOfCorrectAnswers += 2;
    } else if (competence.challenges.length < 3 && _isQROCMdepPartially(challenge, answer)) {
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
  if (reproductibilityRate < minimumReproductibilityRateToBeTrusted && numberOfCorrectAnswers === 2) {
    return numberOfPixForOneLevel;
  }
  return 0;
}

function _getCertifiedLevel(numberOfCorrectAnswers, competence, reproductibilityRate) {
  if (numberOfCorrectAnswers < 2) {
    return uncertifiedLevel;
  }
  if (reproductibilityRate < minimumReproductibilityRateToBeTrusted && numberOfCorrectAnswers === 2) {
    return competence.estimatedLevel - 1;
  }
  return competence.estimatedLevel;
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('obtainedScore').sum();
}

function _getCompetencesWithCertifiedLevelAndScore(answersWithCompetences, listCompetences, reproductibilityRate) {
  return listCompetences.map((competence) => {
    const numberOfCorrectAnswers = _numberOfCorrectAnswersPerCompetence(answersWithCompetences, competence);
    // TODO: Convertir ça en Mark ?
    return {
      name: competence.name,
      index: competence.index,
      id: competence.id,
      positionedLevel: competence.estimatedLevel,
      positionedScore: competence.pixScore,
      obtainedLevel: _getCertifiedLevel(numberOfCorrectAnswers, competence, reproductibilityRate),
      obtainedScore: competence.pixScore - _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence,
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
      positionedLevel: competence.estimatedLevel,
      positionedScore: competence.pixScore,
      obtainedLevel: uncertifiedLevel,
      obtainedScore: 0
    };
  });
}

function _checkIfUserCanStartACertification(userCompetences) {
  const nbCompetencesWithEstimatedLevelHigherThan0 = userCompetences
    .filter(competence => competence.estimatedLevel > 0)
    .length;

  if (nbCompetencesWithEstimatedLevelHigherThan0 < 5)
    throw new UserNotAuthorizedToCertifyError();
}

function _getResult(listAnswers, listChallenges, listCompetences) {
  const reproductibilityRate = Math.round(answerServices.getAnswersSuccessRate(listAnswers));
  if (reproductibilityRate < minimumReproductibilityRateToBeCertified) {
    return {
      competencesWithMark: _getCompetenceWithFailedLevel(listCompetences),
      totalScore: 0,
      percentageCorrectAnswers: reproductibilityRate
    };
  }

  const answersWithCompetences = _enhanceAnswersWithCompetenceId(listAnswers, listChallenges);
  const competencesWithMark = _getCompetencesWithCertifiedLevelAndScore(answersWithCompetences, listCompetences, reproductibilityRate);
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competencesWithMark);

  return { competencesWithMark, totalScore: scoreAfterRating, percentageCorrectAnswers: reproductibilityRate };
}

function _getChallengeInformation(listAnswers, certificationChallenges, competences) {
  return listAnswers.map((answer) => {

    const certificationChallengeRelatedToAnswer = certificationChallenges.find(
      certificationChallenge => certificationChallenge.challengeId === answer.challengeId
    ) || {};

    const competenceValidatedByCertifChallenge = competences.find(competence => competence.id === certificationChallengeRelatedToAnswer.competenceId) || {};

    return {
      result: answer.result.status,
      value: answer.value,
      challengeId: answer.challengeId,
      competence: competenceValidatedByCertifChallenge.index || '',
      skill: certificationChallengeRelatedToAnswer.associatedSkill || ''
    };
  });
}

function _getCertificationResult(assessment) {
  let startOfCertificationDate;

  return Promise.all([assessment, answersRepository.findByAssessment(assessment.id)])
    .then(([assessment, answersByAssessments]) => {
      startOfCertificationDate = assessment.createdAt;
      return Promise.all([assessment, answersByAssessments, certificationChallengesRepository.findByCertificationCourseId(assessment.courseId)]);
    })
    .then(([assessment, answersByAssessments, certificationChallenges]) => {
      const userId = assessment.userId;

      return Promise.all([
        assessment,
        answersByAssessments,
        certificationChallenges,
        userService.getProfileToCertify(userId, startOfCertificationDate),
        certificationCourseRepository.get(assessment.courseId),
        competenceRepository.find()
      ]);
    })
    .then(([assessment, listAnswers, certificationChallenges, listCompetences, certificationCourse, competences]) => {
      const testedCompetences = listCompetences.filter(competence => competence.challenges.length > 0);

      const result = _getResult(listAnswers, certificationChallenges, testedCompetences);
      // FIXME: Missing tests
      result.createdAt = startOfCertificationDate;
      result.userId = assessment.userId;
      result.status = certificationCourse.status;
      result.completedAt = certificationCourse.completedAt;
      result.listChallengesAndAnswers = _getChallengeInformation(listAnswers, certificationChallenges, competences);
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

  getCertificationResult(certificationCourseId) {
    let assessment = {};
    return assessmentRepository
      .getByCertificationCourseId(certificationCourseId)
      .then(foundAssessement => {
        assessment = foundAssessement;
        return certificationCourseRepository.get(certificationCourseId);
      })
      .then(certification => {
        //TODO: 1088 - modify rejectionReason and add status
        return {
          pixScore: assessment.pixScore,
          createdAt: certification.createdAt,
          completedAt: certification.completedAt,
          competencesWithMark: assessment.marks,
          firstName: certification.firstName,
          lastName: certification.lastName,
          birthdate: certification.birthdate,
          birthplace: certification.birthplace,
          rejectionReason: certification.rejectionReason,
          sessionId: certification.sessionId,
        };
      });
  },

  startNewCertification(userId, sessionId) {
    let userCompetencesToCertify;
    const newCertificationCourse = new CertificationCourse({ userId, status: 'started', sessionId });

    return userService.getProfileToCertify(userId, moment().toISOString())
      .then(userCompetences => {
        userCompetencesToCertify = userCompetences;
        return _checkIfUserCanStartACertification(userCompetences);
      })
      .then(() => certificationCourseRepository.save(newCertificationCourse))
      .then(savedCertificationCourse => certificationChallengesService.saveChallenges(userCompetencesToCertify, savedCertificationCourse));
  }
};
