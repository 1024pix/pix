const usecases = require('../../domain/usecases');
const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const courseService = require('../../../lib/domain/services/course-service');
const { extractUserIdFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  get(request) {
    const courseId = request.params.id;
    const userId = extractUserIdFromRequest(request);

    return courseService
      .getCourse({ courseId, userId })
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
  }

};
