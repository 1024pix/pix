const usecases = require('../../domain/usecases');
const badgeWithLearningContentSerializer = require('../../infrastructure/serializers/jsonapi/badge-with-learning-content-serializer');
const badgeSerializer = require('../../infrastructure/serializers/jsonapi/badge-serializer');

module.exports = {
  async getBadge(request) {
    const badgeId = request.params.id;
    const badgeWithLearningContent = await usecases.getBadgeDetails({ badgeId });
    return badgeWithLearningContentSerializer.serialize(badgeWithLearningContent);
  },

  async updateBadge(request, h) {
    const badgeId = request.params.id;
    const badge = badgeSerializer.deserialize(request.payload);

    const updatedBadge = await usecases.updateBadge({ badgeId, badge });

    return h.response(badgeSerializer.serialize(updatedBadge)).code(204);
  },

  async deleteUnassociatedBadge(request, h) {
    const badgeId = request.params.id;
    await usecases.deleteUnassociatedBadge({ badgeId });

    return h.response().code(204);
  },
};
