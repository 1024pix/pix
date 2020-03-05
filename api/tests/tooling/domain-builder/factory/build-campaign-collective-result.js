const faker = require('faker');
const CampaignCollectiveResult = require('../../../../lib/domain/models/CampaignCollectiveResult');

module.exports = function buildCampaignCollectiveResult(
  {
    id = faker.random.number(),
    campaignCompetenceCollectiveResults = [],
    campaignTubeCollectiveResults = [],
  } = {}) {
  return new CampaignCollectiveResult({
    id,
    campaignCompetenceCollectiveResults,
    campaignTubeCollectiveResults,
  });
};
