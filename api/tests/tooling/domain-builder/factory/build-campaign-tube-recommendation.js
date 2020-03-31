const CampaignTubeRecommendation = require('../../../../lib/domain/models/CampaignTubeRecommendation');

module.exports = function buildCampaignTubeRecommendation(
  {
    campaignId,
    competenceId,
    competenceName,
    tubeId,
    tubePracticalTitle,
    areaColor,
  } = {}) {
  return new CampaignTubeRecommendation({
    campaignId,
    tubeId,
    competenceId,
    competenceName,
    tubePracticalTitle,
    areaColor,
  });
};
