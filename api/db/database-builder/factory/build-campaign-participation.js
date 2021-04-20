const buildCampaign = require('./build-campaign');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCampaignParticipation({
  id = databaseBuffer.getNextId(),
  campaignId,
  isShared = true,
  createdAt = new Date('2020-01-01'),
  sharedAt = new Date('2020-01-02'),
  userId,
  participantExternalId = 'participantExternalId',
  validatedSkillsCount,
  isImproved,
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  campaignId = _.isUndefined(campaignId) ? buildCampaign().id : campaignId;
  sharedAt = isShared ? sharedAt : null;

  const values = {
    id,
    campaignId,
    userId,
    isShared,
    createdAt,
    sharedAt,
    participantExternalId,
    validatedSkillsCount,
    isImproved,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });
};
