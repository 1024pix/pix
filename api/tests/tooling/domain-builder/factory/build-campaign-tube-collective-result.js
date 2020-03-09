const CampaignTubeCollectiveResult = require('../../../../lib/domain/models/CampaignTubeCollectiveResult');

module.exports = function buildCampaignTubeCollectiveResult(
  {
    campaignId,
    competenceName,
    tubeId,
    tubePracticalTitle,
    areaColor,
    totalSkillsCount,
    averageValidatedSkills,
  } = {}) {
  return new CampaignTubeCollectiveResult({
    campaignId,
    competenceName,
    tubeId,
    tubePracticalTitle,
    areaColor,
    totalSkillsCount,
    averageValidatedSkills,
  });
};
