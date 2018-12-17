const Boom = require('boom');
const logger = require('../../infrastructure/logger');
const errorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const certificationService = require('../../domain/services/certification-service');
const certificationCourseService = require('../../../lib/domain/services/certification-course-service');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const { NotFoundError, WrongDateFormatError } = require('../../domain/errors');

module.exports = {

  computeResult(request) {
    const certificationCourseId = request.params.id;

    return certificationService.calculateCertificationResultByCertificationCourseId(certificationCourseId)
      .catch((err) => {
        logger.error(err);
        throw Boom.badImplementation(err);
      });
  },

  getResult(request) {
    const certificationCourseId = request.params.id;
    return certificationService.getCertificationResult(certificationCourseId)
      .then(certificationCourseSerializer.serializeResult)
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw Boom.notFound(err);
        }
        logger.error(err);
        throw Boom.badImplementation(err);
      });
  },

  update(request, h) {

    return certificationSerializer.deserialize(request.payload)
      .then((certificationCourse) => certificationCourseService.update(certificationCourse))
      .then(certificationSerializer.serializeFromCertificationCourse)
      .catch((err) => {
        if (err instanceof WrongDateFormatError) {
          return h.response(errorSerializer.serialize(err.getErrorMessage())).code(400);
        } else if (err.message === 'ValidationError') {
          return h.response(errorSerializer.serialize(err)).code(400);
        } else {
          throw Boom.notFound(err);
        }
      });
  },
};
