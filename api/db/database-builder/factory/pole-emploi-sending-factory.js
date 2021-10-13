const buildCampaignParticipation = require('./build-campaign-participation');
const buildUser = require('./build-user');
const buildAuthenticationMethod = require('./build-authentication-method');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

function build({
  id = databaseBuffer.getNextId(),
  isSuccessful = true,
  responseCode = '200',
  type = 'CAMPAIGN_PARTICIPATION_START',
  payload = { individu: {} },
  createdAt = new Date('2020-01-01'),
  campaignParticipationId,
} = {}) {
  campaignParticipationId = _.isNil(campaignParticipationId)
    ? buildCampaignParticipation().id
    : campaignParticipationId;

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
}

function buildWithUser(sendingAttributes, externalIdentifier) {
  const { id: userId } = buildUser();
  buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId, externalIdentifier });
  const { id: campaignParticipationId } = buildCampaignParticipation({ userId });
  return build({ ...sendingAttributes, campaignParticipationId });
}

module.exports = {
  build,
  buildWithUser,
};
