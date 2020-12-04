const buildCampaignParticipation = require('./build-campaign-participation');
const isUndefined = require('lodash/isUndefined');
const faker = require('faker');
const PoleEmploiSending = require('../../../../lib/domain/models/PoleEmploiSending');

const buildPoleEmploiSending = function({
  type = PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
  campaignParticipationId,
  createdAt = faker.date.past(),
} = {}) {

  campaignParticipationId = isUndefined(campaignParticipationId) ? buildCampaignParticipation().id : campaignParticipationId;

  return new PoleEmploiSending({
    campaignParticipationId,
    type,
    payload: null,
    createdAt,
  });
};

module.exports = buildPoleEmploiSending;
