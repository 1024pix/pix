const usecases = require('../../domain/usecases');
const badgeWithLearningContentSerializer = require('../../infrastructure/serializers/jsonapi/badge-with-learning-content-serializer');

module.exports = {
  async getBadge(request) {
    const badgeId = parseInt(request.params.id);
    const badgeWithLearningContent = await usecases.getBadgeDetails({ badgeId });
    return badgeWithLearningContentSerializer.serialize(badgeWithLearningContent);
  },
};
