const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildCampaign = require('./build-campaign');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCampaignParticipation({
  id = faker.random.number(),
  assessmentId = buildAssessment().id,
  campaignId = buildCampaign().id,
  isShared = faker.random.boolean(),
  sharedAt = faker.date.past(),
} = {}) {

  const values = {
    id, assessmentId, campaignId, isShared, sharedAt
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });

  return values;
};

