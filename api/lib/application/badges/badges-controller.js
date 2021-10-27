const usecases = require('../../domain/usecases');
const badgeWithLearningContentSerializer = require('../../infrastructure/serializers/jsonapi/badge-with-learning-content-serializer');
const badgeCriteriaSerializer = require('../../infrastructure/serializers/jsonapi/badge-criteria-serializer');

module.exports = {
  async getBadge(request) {
    const badgeId = request.params.id;
    const badgeWithLearningContent = await usecases.getBadgeDetails({ badgeId });
    return badgeWithLearningContentSerializer.serialize(badgeWithLearningContent);
  },

  async createBadgeCriterion(request, h) {
    const badgeId = request.params.id;
    const badgeCriterion = badgeCriteriaSerializer.deserialize(request.payload);
    const savedBadgeCriterion = await usecases.createBadgeCriteria({ badgeId, badgeCriterion });
    return h.response(badgeCriteriaSerializer.serialize(savedBadgeCriterion));
  },
};
