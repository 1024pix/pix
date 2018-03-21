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

  list(request, reply) {
    return _fetchCourses(request.query)
      .then(courses => reply(courseSerializer.serialize(courses)))
      .catch((err) => {
        logger.error(err);
        return reply(Boom.badImplementation(err));
      });
  },

  get(request, reply) {
    const courseId = request.params.id;

    return courseService
      .getCourse(courseId)
      .then(course => reply(courseSerializer.serialize(course)))
      .catch(err => {
        if (err instanceof NotFoundError) {
          return reply(Boom.notFound(err));
        }

        logger.error(err);

        return reply(Boom.badImplementation(err));
      });
  },

  refresh(request, reply) {
    return courseRepository
      .refresh(request.params.id)
      .then(course => reply(courseSerializer.serialize(course)))
      .catch((err) => {
        logger.error(err);
        return reply(Boom.badImplementation(err));
      });
  },

  refreshAll(request, reply) {
    return courseRepository
      .refreshAll()
      .then(() => reply('Courses updated'))
      .catch(reply);
  },

  save(request, reply) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];
    return sessionService.sessionExists(accessCode)
      .then((sessionId) => certificationService.startNewCertification(userId, sessionId))
      .then(certificationCourse => reply(certificationCourseSerializer.serialize(certificationCourse)).code(201))
      .catch(err => {
        if (err instanceof UserNotAuthorizedToCertifyError) {
          const errorHttpStatusCode = 403;
          const jsonApiError = new JSONAPIError({
            status: errorHttpStatusCode.toString(),
            title: 'User not authorized to certify',
            detail: 'The user cannot be certified.'
          });
          return reply(jsonApiError).code(errorHttpStatusCode);
        } else if (err instanceof NotFoundError) {
          const errorHttpStatusCode = 404;
          const jsonApiError = new JSONAPIError({
            status: errorHttpStatusCode.toString(),
            title: 'Session not found',
            detail: 'The access code given do not correspond to session.'
          });
          return reply(jsonApiError).code(errorHttpStatusCode);
        }
        logger.error(err);
        return reply(Boom.badImplementation(err));
      });
  }

};
