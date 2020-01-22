const CampaignCompetenceCollectiveResult = require('../../../../lib/domain/models/CampaignCompetenceCollectiveResult');

module.exports = function buildCampaignCompetenceCollectiveResult(
  {
    campaignId,
    competenceId,
    competenceName,
    competenceIndex,
    areaColor,
    totalSkillsCount,
    averageValidatedSkills,
  } = {}) {
  return new CampaignCompetenceCollectiveResult({
    campaignId,
    competenceId,
    competenceName,
    competenceIndex,
    areaColor,
    totalSkillsCount,
    averageValidatedSkills,
  });
};
