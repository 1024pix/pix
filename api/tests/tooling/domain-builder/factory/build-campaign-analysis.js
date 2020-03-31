const faker = require('faker');
const CampaignAnalysis = require('../../../../lib/domain/models/CampaignAnalysis');

module.exports = function buildCampaignAnalysis(
  {
    id = faker.random.number(),
    campaignTubeRecommendations = [],
  } = {}) {
  return new CampaignAnalysis({
    id,
    campaignTubeRecommendations,
  });
};
