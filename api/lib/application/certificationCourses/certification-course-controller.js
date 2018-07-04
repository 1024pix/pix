const Boom = require('boom');
const logger = require('../../infrastructure/logger');
const errorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const certificationService = require('../../domain/services/certification-service');
const certificationCourseService = require('../../../lib/domain/services/certification-course-service');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const { NotFoundError, WrongDateFormatError } = require('../../domain/errors');

module.exports = {

  computeResult(request, reply) {
    const certificationCourseId = request.params.id;
    let ignoreError = false;
    if(request.route.path.includes('details')) {
      ignoreError = true;
    }

    return certificationService.calculateCertificationResultByCertificationCourseId(certificationCourseId, ignoreError)
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
        if (err instanceof NotFoundError) {
          return reply(Boom.notFound(err));
        }
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  update(request, reply) {

    return certificationSerializer.deserialize(request.payload)
      .then((certificationCourse) => certificationCourseService.update(certificationCourse))
      .then((savedCertificationCourse) => {
        return reply(certificationSerializer.serializeFromCertificationCourse(savedCertificationCourse));
      })
      .catch((err) => {
        if (err instanceof WrongDateFormatError) {
          reply(errorSerializer.serialize(err.getErrorMessage())).code(400);
        } else if (err.message === 'ValidationError') {
          reply(errorSerializer.serialize(err)).code(400);
        } else {
          reply(Boom.notFound(err));
        }
      });
  },
};
