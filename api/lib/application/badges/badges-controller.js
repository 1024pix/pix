const usecases = require('../../domain/usecases');
const badgeSerializer = require('../../infrastructure/serializers/jsonapi/badge-serializer');

module.exports = {
  async getBadge(request) {
    const badgeId = parseInt(request.params.id);
    const badge = await usecases.getBadge({ badgeId });
    return badgeSerializer.serialize(badge);
  },
};
