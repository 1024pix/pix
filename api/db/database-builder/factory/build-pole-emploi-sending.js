const buildCampaignParticipation = require('./build-campaign-participation');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildPoleEmploiSending({
  id = databaseBuffer.getNextId(),
  isSuccessful = true,
  responseCode = '200',
  type = 'CAMPAIGN_PARTICIPATION_START',
  payload = {},
  createdAt = new Date('2020-01-01'),
  campaignParticipationId,
} = {}) {

  campaignParticipationId = _.isNil(campaignParticipationId) ? buildCampaignParticipation().id : campaignParticipationId;

  const values = {
    id,
    isSuccessful,
    responseCode,
    type,
    payload,
    createdAt,
    campaignParticipationId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'pole-emploi-sendings',
    values,
  });
};
