const CampaignParticipation = require('../../../lib/domain/models/CampaignParticipation');
const buildCampaign = require('./build-campaign');

const faker = require('faker');

module.exports = function buildCampaignParticipation(
  {
    id = 1,
    assessmentId = faker.random.number(2),
    campaign = buildCampaign()
  } = {}) {
  return new CampaignParticipation({ id, assessmentId, campaign });
};
