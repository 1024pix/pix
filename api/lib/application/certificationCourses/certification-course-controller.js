const Boom = require('boom');
const logger = require('../../infrastructure/logger');
const CertificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const CertificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const userService = require('../../../lib/domain/services/user-service');
const certificationChallengesService = require('../../../lib/domain/services/certification-challenges-service');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const answersRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const certificationChallengesRepository = require('../../../lib/infrastructure/repositories/certification-challenge-repository');
const certificationService = require('../../domain/services/certification-service');

module.exports = {
  save(request, reply) {
    let certificationCourse;
    const userId = request.pre.userId;
    return CertificationCourseRepository.save()
      .then((savedCertificationCourse) => {
        return certificationCourse = savedCertificationCourse;
      })
      .then(() => userService.getProfileToCertify(userId))
      .then((userProfile) => certificationChallengesService.saveChallenges(userProfile, certificationCourse))
      .then(() => reply(CertificationCourseSerializer.serialize(certificationCourse)).code(201))
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  getScore(request, reply) {
    const certificationCourseId = request.params.id;
    let userId;
    let listAnswers;
    let listCertificationChallenges;

    return assessmentRepository.getByCertificationCourseId(certificationCourseId)
      .then((assessment) => {
        userId = assessment.get('userId');

        return answersRepository.findByAssessment(assessment.get('id'));
      })
      .then((answersByAssessments) => {
        listAnswers = answersByAssessments;
        return certificationChallengesRepository.findByCertificationCourseId(certificationCourseId);
      })
      .then((certificationChallenges) => {
        listCertificationChallenges = certificationChallenges;
        return userService.getProfileToCertify(userId);
      })
      .then((listCompetences) => {
        const testedCompetences = listCompetences.filter(competence => competence.challenges.length > 0);
        return certificationService.getScore(listAnswers, listCertificationChallenges, testedCompetences);
      })
      .then(reply)
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  }

};
