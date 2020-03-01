const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const courseService = require('../../domain/services/demo-service');
const { extractUserIdFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  get(request) {
    const courseId = request.params.id;
    const userId = extractUserIdFromRequest(request);

    return courseService
      .getDemo({ demoId: courseId, userId })
      .then(courseSerializer.serialize);
  },

};
