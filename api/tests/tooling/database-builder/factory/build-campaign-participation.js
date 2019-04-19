const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildCampaign = require('./build-campaign');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCampaignParticipation({
  id = faker.random.number(),
  assessmentId,
  campaignId,
  isShared = faker.random.boolean(),
  createdAt = faker.date.past(),
  sharedAt = new Date(),
  userId,
  participantExternalId = faker.random.word()
} = {}) {

  assessmentId = assessmentId || buildAssessment().id;
  campaignId = campaignId || buildCampaign().id;
  userId = userId || buildUser().id;

  const values = {
    id, assessmentId, campaignId, userId, isShared, createdAt, sharedAt, participantExternalId
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });

  return values;
};
