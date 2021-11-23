const usecases = require('../../domain/usecases');
const badgeWithLearningContentSerializer = require('../../infrastructure/serializers/jsonapi/badge-with-learning-content-serializer');
const badgeCriteriaSerializer = require('../../infrastructure/serializers/jsonapi/badge-criteria-serializer');
const skillSetSerializer = require('../../infrastructure/serializers/jsonapi/skill-set-serializer');

module.exports = {
  async getBadge(request) {
    const badgeId = request.params.id;
    const badgeWithLearningContent = await usecases.getBadgeDetails({ badgeId });
    return badgeWithLearningContentSerializer.serialize(badgeWithLearningContent);
  },

  async createBadgeCriterion(request, h) {
    const badgeId = request.params.id;
    const badgeCriterion = badgeCriteriaSerializer.deserialize(request.payload);
    const savedBadgeCriterion = await usecases.createBadgeCriterion({ badgeId, badgeCriterion });
    return h.response(badgeCriteriaSerializer.serialize(savedBadgeCriterion)).created();
  },

  async createSkillSet(request, h) {
    const badgeId = request.params.id;
    const skillSet = skillSetSerializer.deserialize(request.payload);
    const savedSkillSet = await usecases.createSkillSet({ badgeId, skillSet });
    return h.response(skillSetSerializer.serialize(savedSkillSet)).created();
  },
};
