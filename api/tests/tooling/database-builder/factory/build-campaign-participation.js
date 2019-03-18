const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildCampaign = require('./build-campaign');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCampaignParticipation({
  id = faker.random.number(),
  assessmentId = buildAssessment().id,
  campaignId = buildCampaign().id,
  isShared = faker.random.boolean(),
  createdAt = faker.date.past(),
  sharedAt = faker.date.recent(),
  userId = buildUser().id,
  participantExternalId = faker.random.word()
} = {}) {

  const values = {
    id, assessmentId, campaignId, userId, isShared, createdAt, sharedAt, participantExternalId
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });

  return values;
};
