const usecases = require('../../domain/usecases');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const courseService = require('../../../lib/domain/services/course-service');

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
      .then(courseSerializer.serialize);
  },

  get(request) {
    const courseId = request.params.id;

    return courseService
      .getCourse(courseId)
      .then(courseSerializer.serialize);
  },

  save(request, h) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];

    return usecases.retrieveLastOrCreateCertificationCourse({ accessCode, userId })
      .then(({ created, certificationCourse }) => {
        const serialized = certificationCourseSerializer.serialize(certificationCourse);

        return created ? h.response(serialized).created() : serialized;
      });
  },

  // TODO: [PF-577] Creuser le sessionExist() -> Controller porte la logique de renvoyer un 404
  //  lorsque la session n'existe pas ?

  retrieveOrCreateCertificationCourseFromKnowledgeElements(request, h) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];

    return usecases.retrieveOrCreateCertificationCourseFromKnowledgeElements({ accessCode, userId })
      .then(({ created, certificationCourse }) => {
        const serialized = certificationCourseSerializer.serialize(certificationCourse);

        return created ? h.response(serialized).created() : serialized;
      });
  }

};
