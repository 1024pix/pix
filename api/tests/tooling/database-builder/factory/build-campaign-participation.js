const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildCampaign = require('./build-campaign');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCampaignParticipation({
  id,
  assessmentId,
  campaignId,
  isShared = faker.random.boolean(),
  createdAt = faker.date.past(),
  sharedAt = new Date(),
  userId,
  participantExternalId = faker.random.word()
} = {}) {

  assessmentId = _.isNil(assessmentId) ? buildAssessment().id : assessmentId;
  campaignId = _.isNil(campaignId) ? buildCampaign().id : campaignId;
  userId = _.isNil(userId) ? buildUser().id : userId;

  const values = {
    id, assessmentId, campaignId, userId, isShared, createdAt, sharedAt, participantExternalId
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });
};
