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
  sharedAt = faker.date.past(),
  userId = buildUser().id,
} = {}) {

  const values = {
    id, assessmentId, campaignId, userId, isShared, sharedAt
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });

  return values;
};

