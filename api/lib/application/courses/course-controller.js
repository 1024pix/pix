const Boom = require('boom');

const courseRepository = require('../../infrastructure/repositories/course-repository');
const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const certificationService = require('../../../lib/domain/services/certification-service');
const sessionService = require('../../../lib/domain/services/session-service');
const courseService = require('../../../lib/domain/services/course-service');
const { NotFoundError } = require('../../../lib/domain/errors');
const { UserNotAuthorizedToCertifyError } = require('../../../lib/domain/errors');
const JSONAPIError = require('jsonapi-serializer').Error;

const logger = require('../../infrastructure/logger');

function _fetchCourses(query) {
  if (query.isAdaptive === 'true') {
    return courseRepository.getAdaptiveCourses();
  }
  if (query.isCourseOfTheWeek === 'true') {
    return courseRepository.getCoursesOfTheWeek();
  }
  return courseRepository.getProgressionCourses();
}

module.exports = {

  list(request) {
    return _fetchCourses(request.query)
      .then(courseSerializer.serialize)
      .catch((err) => {
        logger.error(err);
        throw Boom.badImplementation(err);
      });
  },

  get(request) {
    const courseId = request.params.id;

    return courseService
      .getCourse(courseId)
      .then(courseSerializer.serialize)
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw Boom.notFound(err);
        }

        logger.error(err);

        throw Boom.badImplementation(err);
      });
  },

  save(request, h) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];
    return sessionService.sessionExists(accessCode)
      .then((sessionId) => certificationService.startNewCertification(userId, sessionId))
      .then((certificationCourse) => h.response(certificationCourseSerializer.serialize(certificationCourse)).code(201))
      .catch((err) => {
        if (err instanceof UserNotAuthorizedToCertifyError) {
          const errorHttpStatusCode = 403;
          const jsonApiError = new JSONAPIError({
            status: errorHttpStatusCode.toString(),
            title: 'User not authorized to certify',
            detail: 'The user cannot be certified.'
          });
          return h.response(jsonApiError).code(errorHttpStatusCode);
        } else if (err instanceof NotFoundError) {
          const errorHttpStatusCode = 404;
          const jsonApiError = new JSONAPIError({
            status: errorHttpStatusCode.toString(),
            title: 'Session not found',
            detail: 'The access code given do not correspond to session.'
          });
          return h.response(jsonApiError).code(errorHttpStatusCode);
        }
        logger.error(err);
        throw Boom.badImplementation(err);
      });
  }

};
