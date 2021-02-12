const buildCampaignParticipation = require('./build-campaign-participation');
const isUndefined = require('lodash/isUndefined');
const PoleEmploiSending = require('../../../../lib/domain/models/PoleEmploiSending');

const buildPoleEmploiSending = function({
  type = PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
  campaignParticipationId,
  isSuccessful = true,
  responseCode = '200',
  payload = null,
  createdAt = new Date('2020-01-01'),
} = {}) {

  campaignParticipationId = isUndefined(campaignParticipationId) ? buildCampaignParticipation().id : campaignParticipationId;

  return new PoleEmploiSending({
    campaignParticipationId,
    type,
    isSuccessful,
    responseCode,
    payload,
    createdAt,
  });
};

module.exports = buildPoleEmploiSending;
