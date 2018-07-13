const MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED = 50;
const MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED = 80;
const NUMBER_OF_PIX_FOR_ONE_LEVEL = 8;
const UNCERTIFIED_LEVEL = -1;
const qrocmDepChallenge = 'QROCM-dep';

const _ = require('lodash');
const moment = require('moment');

const AnswerStatus = require('../models/AnswerStatus');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const CertificationContract = require('../../domain/models/CertificationContract');

const {
  CertificationComputeError,
  NotCompletedAssessmentError,
  UserNotAuthorizedToCertifyError
} = require('../../../lib/domain/errors');

const answerServices = require('./answer-service');
const certificationChallengesService = require('../../../lib/domain/services/certification-challenges-service');
const userService = require('../../../lib/domain/services/user-service');

const answersRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const certificationChallengesRepository = require('../../../lib/infrastructure/repositories/certification-challenge-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');

function _enhanceAnswersWithCompetenceId(listAnswers, listChallenges, continueOnError) {
  return _.map(listAnswers, (answer) => {
    const challenge = listChallenges.find((challenge) => challenge.challengeId === answer.challengeId);
    if (!challenge) {
      if (!continueOnError) {
        throw new CertificationComputeError('Problème de chargement de la compétence pour le challenge ' + answer.challengeId);
      }
    } else {
      answer.competenceId = challenge.competenceId;
    }
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

function _numberOfCorrectAnswersPerCompetence(answersWithCompetences, competence, certificationChallenges, continueOnError) {
  const answersForCompetence = _.filter(answersWithCompetences, answer => answer.competenceId === competence.id);
  const challengesForCompetence = _.filter(certificationChallenges, challenge => challenge.competenceId === competence.id);

  if (!continueOnError) {
    CertificationContract.assertThatCompetenceHasEnoughChallenge(challengesForCompetence, competence.index);

    CertificationContract.assertThatCompetenceHasEnoughAnswers(answersForCompetence, competence.index);
  }

  let nbOfCorrectAnswers = 0;
  answersForCompetence.forEach(answer => {
    const challenge = _.find(certificationChallenges, challenge => challenge.challengeId === answer.challengeId);

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
    return NUMBER_OF_PIX_FOR_ONE_LEVEL;
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

function _getCompetencesWithCertifiedLevelAndScore(answersWithCompetences, listCompetences, reproductibilityRate, certificationChallenges, continueOnError) {
  return listCompetences.map((competence) => {
    const numberOfCorrectAnswers = _numberOfCorrectAnswersPerCompetence(answersWithCompetences, competence, certificationChallenges, continueOnError);
    // TODO: Convertir ça en Mark ?
    return {
      name: competence.name,
      index: competence.index,
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
    // TODO: Convertir ça en Mark ?
    return {
      name: competence.name,
      index: competence.index,
      id: competence.id,
      positionedLevel: competence.estimatedLevel,
      positionedScore: competence.pixScore,
      obtainedLevel: UNCERTIFIED_LEVEL,
      obtainedScore: 0,
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

function _getResult(listAnswers, certificationChallenges, testedCompetences, continueOnError) {

  if (!continueOnError) {
    CertificationContract.assertThatWeHaveEnoughAnswers(listAnswers, certificationChallenges);
  }

  const reproductibilityRate = Math.round(answerServices.getAnswersSuccessRate(listAnswers));
  if (reproductibilityRate < MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED) {
    return {
      competencesWithMark: _getCompetenceWithFailedLevel(testedCompetences),
      totalScore: 0,
      percentageCorrectAnswers: reproductibilityRate,
    };
  }

  const answersWithCompetences = _enhanceAnswersWithCompetenceId(listAnswers, certificationChallenges, continueOnError);
  const competencesWithMark = _getCompetencesWithCertifiedLevelAndScore(answersWithCompetences, testedCompetences, reproductibilityRate, certificationChallenges, continueOnError);
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competencesWithMark);

  if (!continueOnError) {
    CertificationContract.assertThatScoreIsCoherentWithReproductibilityRate(scoreAfterRating, reproductibilityRate);
  }

  return { competencesWithMark, totalScore: scoreAfterRating, percentageCorrectAnswers: reproductibilityRate };
}

function _getChallengeInformation(listAnswers, certificationChallenges, competences) {
  return listAnswers.map((answer) => {

    const certificationChallengeRelatedToAnswer = certificationChallenges.find(
      certificationChallenge => certificationChallenge.challengeId === answer.challengeId,
    ) || {};

    const competenceValidatedByCertifChallenge = competences.find(competence => competence.id === certificationChallengeRelatedToAnswer.competenceId) || {};

    return {
      result: answer.result.status,
      value: answer.value,
      challengeId: answer.challengeId,
      competence: competenceValidatedByCertifChallenge.index || '',
      skill: certificationChallengeRelatedToAnswer.associatedSkill || '',
    };
  });
}

function _getCertificationResult(assessment, continueOnError = false) {
  return Promise.all([
    answersRepository.findByAssessment(assessment.id),
    certificationChallengesRepository.findByCertificationCourseId(assessment.courseId),
    assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(assessment.userId, assessment.createdAt),
    certificationCourseRepository.get(assessment.courseId),
    competenceRepository.find(),
    challengeRepository.list(),
  ]).then(([assessmentAnswers, certificationChallenges, userCompletedAssessments, certificationCourse, allCompetences, allChallenges]) => {
    const testedCompetences = userCompletedAssessments
      .filter(assessment => assessment.isCertifiable())
      .map(assessment => {
        const competenceOfAssessment = _.find(allCompetences, competence => competence.courseId === assessment.courseId);
        return {
          id: competenceOfAssessment.id,
          index: competenceOfAssessment.index,
          name: competenceOfAssessment.name,
          estimatedLevel: assessment.getLastAssessmentResult().level,
          pixScore: assessment.getLastAssessmentResult().pixScore,
        };
      });

    certificationChallenges.forEach(certifChallenge => {
      const challenge = _.find(allChallenges, challengeFromAirtable => challengeFromAirtable.id === certifChallenge.challengeId);
      certifChallenge.type = challenge.type || '';
    });

    const result = _getResult(assessmentAnswers, certificationChallenges, testedCompetences, continueOnError);
    // FIXME: Missing tests
    result.createdAt = assessment.createdAt;
    result.userId = assessment.userId;
    result.status = assessment.state;
    result.completedAt = certificationCourse.completedAt;

    result.listChallengesAndAnswers = _getChallengeInformation(assessmentAnswers, certificationChallenges, allCompetences);
    return result;
  });
}

module.exports = {

  calculateCertificationResultByCertificationCourseId(certificationCourseId) {
    const continueOnError = true;
    return assessmentRepository
      .getByCertificationCourseId(certificationCourseId)
      .then(assessment => _getCertificationResult(assessment, continueOnError));
  },

  calculateCertificationResultByAssessmentId(assessmentId) {
    const continueOnError = false;
    return assessmentRepository
      .get(assessmentId)
      .then(assessment => _getCertificationResult(assessment, continueOnError));
  },

  getCertificationResult(certificationCourseId) {
    let assessment = {};
    let assessmentLastResult;
    let certification = {};
    return assessmentRepository
      .getByCertificationCourseId(certificationCourseId)
      .then(foundAssessment => {
        certification = certificationCourseRepository.get(certificationCourseId);
        assessment = foundAssessment;
        return certification;
      })
      .then(foundCertification => {
        certification = foundCertification;
        if (assessment == null) {
          throw new NotCompletedAssessmentError();
        }
        assessmentLastResult = assessment.getLastAssessmentResult();
        return assessmentResultRepository.get(assessmentLastResult.id);
      })
      .then(assessmentResult => {
        return {
          level: assessmentLastResult.level,
          certificationId: certification.id,
          assessmentId: assessment.id,
          emitter: assessmentLastResult.emitter,
          commentForJury: assessmentLastResult.commentForJury,
          commentForCandidate: assessmentLastResult.commentForCandidate,
          commentForOrganization: assessmentLastResult.commentForOrganization,
          status: assessmentLastResult.status,
          pixScore: assessmentLastResult.pixScore,
          createdAt: certification.createdAt,
          juryId: assessmentLastResult.juryId,
          resultCreatedAt: assessmentLastResult.createdAt,
          completedAt: certification.completedAt,
          competencesWithMark: assessmentResult.competenceMarks,
          firstName: certification.firstName,
          lastName: certification.lastName,
          birthdate: certification.birthdate,
          birthplace: certification.birthplace,
          sessionId: certification.sessionId,
          externalId: certification.externalId,
        };
      });
  },

  startNewCertification(userId, sessionId) {
    let userCompetencesToCertify;
    const newCertificationCourse = CertificationCourse.fromAttributes({ userId, sessionId });

    return userService.getProfileToCertify(userId, moment().toISOString())
      .then(userCompetences => {
        userCompetencesToCertify = userCompetences;
        return _checkIfUserCanStartACertification(userCompetences);
      })
      .then(() => certificationCourseRepository.save(newCertificationCourse))
      .then(savedCertificationCourse => certificationChallengesService.saveChallenges(userCompetencesToCertify, savedCertificationCourse));
  },
};
