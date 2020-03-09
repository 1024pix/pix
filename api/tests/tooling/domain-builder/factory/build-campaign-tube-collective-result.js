const CampaignTubeCollectiveResult = require('../../../../lib/domain/models/CampaignTubeCollectiveResult');

module.exports = function buildCampaignTubeCollectiveResult(
  {
    campaignId,
    tubeId,
    tubePracticalTitle,
    areaColor,
    totalSkillsCount,
    averageValidatedSkills,
  } = {}) {
  return new CampaignTubeCollectiveResult({
    campaignId,
    tubeId,
    tubePracticalTitle,
    areaColor,
    totalSkillsCount,
    averageValidatedSkills,
  });
};
