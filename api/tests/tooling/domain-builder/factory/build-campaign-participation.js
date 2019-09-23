const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const buildCampaign = require('./build-campaign');
const buildCampaignParticipationResult = require('./build-campaign-participation-result');

const faker = require('faker');

module.exports = function buildCampaignParticipation(
  {
    id = 1,
    campaign = buildCampaign(),
    isShared = faker.random.boolean(),
    sharedAt = faker.date.recent(),
    createdAt = faker.date.recent(),
    participantExternalId = 'Mon mail pro',
    campaignId = campaign.id,
    assessmentId = null,
    userId = faker.random.number(2),
    campaignParticipationResult = buildCampaignParticipationResult()
  } = {}) {

  return new CampaignParticipation({
    id,
    campaign,
    isShared,
    sharedAt,
    createdAt,
    participantExternalId,
    campaignId,
    assessmentId,
    userId,
    campaignParticipationResult
  });
};
