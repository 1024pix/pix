const usecases = require('../../domain/usecases/index.js');
const badgeSerializer = require('../../infrastructure/serializers/jsonapi/badge-serializer.js');

module.exports = {
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
