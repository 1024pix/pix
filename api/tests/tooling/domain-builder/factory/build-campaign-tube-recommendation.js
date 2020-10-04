const CampaignTubeRecommendation = require('../../../../lib/domain/models/CampaignTubeRecommendation');

module.exports = function buildCampaignTubeRecommendation(
  {
    campaignId,
    area,
    competence,
    tube,
    validatedKnowledgeElements,
    maxSkillLevelInTargetProfile,
    participantsCount,
    tutorials,
  } = {}) {
  return new CampaignTubeRecommendation({
    campaignId,
    tube,
    competence,
    area,
    validatedKnowledgeElements,
    maxSkillLevelInTargetProfile,
    participantsCount,
    tutorials,
  });
};
