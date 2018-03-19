const Boom = require('boom');

const courseRepository = require('../../infrastructure/repositories/course-repository');
const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const certificationService = require('../../../lib/domain/services/certification-service');
const courseService = require('../../../lib/domain/services/course-service');
const { NotFoundError } = require('../../../lib/domain/errors');
const { UserNotAuthorizedToCertifyError } = require('../../../lib/domain/errors');

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

    return certificationService.startNewCertification(userId)
      .then(certificationCourse => reply(certificationCourseSerializer.serialize(certificationCourse)).code(201))
      .catch(err => {
        if (err instanceof UserNotAuthorizedToCertifyError) {
          return reply(Boom.forbidden(err));
        }
        logger.error(err);
        return reply(Boom.badImplementation(err));
      });
  }

};
