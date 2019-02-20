const usecases = require('../../domain/usecases');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const courseService = require('../../../lib/domain/services/course-service');
const errorManager = require('../../infrastructure/utils/error-manager');

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

  list(request, h) {
    return _fetchCourses(request.query)
      .then(courseSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
  },

  get(request, h) {
    const courseId = request.params.id;

    return courseService
      .getCourse(courseId)
      .then(courseSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
  },

  save(request, h) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];

    return usecases.retrieveLastOrCreateCertificationCourse({ accessCode, userId })
      .then(({ created, certificationCourse }) => {
        const serialized = certificationCourseSerializer.serialize(certificationCourse);

        return created ? h.response(serialized).created() : serialized;
      })
      .catch((error) => errorManager.send(h, error));
  }

};
