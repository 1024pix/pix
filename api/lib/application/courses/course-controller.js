const usecases = require('../../domain/usecases');
const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const { extractUserIdFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  async get(request) {
    const courseId = request.params.id;
    const userId = extractUserIdFromRequest(request);

    const demo = await usecases.getDemo({ demoId: courseId, userId });
    return courseSerializer.serialize(demo);
  },

};
