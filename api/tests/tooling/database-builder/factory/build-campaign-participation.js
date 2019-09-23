const faker = require('faker');
const buildCampaign = require('./build-campaign');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCampaignParticipation({
  id,
  campaignId,
  isShared = faker.random.boolean(),
  createdAt = faker.date.past(),
  sharedAt = faker.date.past(),
  userId,
  participantExternalId = faker.random.word(),
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  campaignId = _.isUndefined(campaignId) ? buildCampaign().id : campaignId;

  const values = {
    id,
    campaignId,
    userId,
    isShared,
    createdAt,
    sharedAt,
    participantExternalId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });
};
