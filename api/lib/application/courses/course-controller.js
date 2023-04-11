const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer.js');
const courseService = require('../../../lib/domain/services/course-service.js');
const { extractUserIdFromRequest } = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
  get(request, h, dependencies = { courseService, courseSerializer }) {
    const courseId = request.params.id;
    const userId = extractUserIdFromRequest(request);

    return dependencies.courseService.getCourse({ courseId, userId }).then(dependencies.courseSerializer.serialize);
  },
};
