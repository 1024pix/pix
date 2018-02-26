const Boom = require('boom');
const logger = require('../../infrastructure/logger');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const certificationService = require('../../domain/services/certification-service');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  computeResult(request, reply) {
    const certificationCourseId = request.params.id;

    return certificationService.calculateCertificationResultByCertificationCourseId(certificationCourseId)
      .then(reply)
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  getResult(request, reply) {
    const certificationCourseId = request.params.id;
    return certificationService.getCertificationResult(certificationCourseId)
      .then(certificationResult => {
        reply(certificationCourseSerializer.serializeResult(certificationResult));
      })
      .catch((err) => {
        if(err instanceof NotFoundError) {
          return reply(Boom.notFound(err));
        }
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
