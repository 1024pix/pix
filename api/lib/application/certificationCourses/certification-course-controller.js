const Boom = require('boom');
const logger = require('../../infrastructure/logger');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const certificationService = require('../../domain/services/certification-service');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');

module.exports = {

  getResult(request, reply) {
    const certificationCourseId = request.params.id;

    return certificationService.calculateCertificationResultByCertificationCourseId(certificationCourseId)
      .then(reply)
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  get(request, reply) {
    const certificationCourseId = request.params.id;
    return certificationCourseRepository.get(certificationCourseId)
      .then((certificationCourse) => {
        reply(certificationCourseSerializer.serialize(certificationCourse));
      })
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  }

};
