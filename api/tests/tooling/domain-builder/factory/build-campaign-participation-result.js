const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');

module.exports = function buildCampaignParticipationResult({
  id = 1,
  isCompleted = true,
  totalSkillsCount = 10,
  testedSkillsCount = 8,
  validatedSkillsCount = 5,
  competenceResults = [],
  campaignParticipationBadges,
  reachedStage = {},
  stageCount = 5,
} = {}) {
  return new CampaignParticipationResult({
    id,
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    competenceResults,
    campaignParticipationBadges,
    reachedStage,
    stageCount,
  });
};
