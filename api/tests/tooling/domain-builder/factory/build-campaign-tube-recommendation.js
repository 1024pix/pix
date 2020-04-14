const CampaignTubeRecommendation = require('../../../../lib/domain/models/CampaignTubeRecommendation');

module.exports = function buildCampaignTubeRecommendation(
  {
    campaignId,
    competence,
    tube,
    skills,
    validatedKnowledgeElements,
    maxSkillLevelInTargetProfile,
    participantsCount
  } = {}) {
  return new CampaignTubeRecommendation({
    campaignId,
    tube,
    competence,
    skills,
    validatedKnowledgeElements,
    maxSkillLevelInTargetProfile,
    participantsCount
  });
};
