const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildCampaign = require('./build-campaign');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCampaignParticipation({
  id = faker.random.number(),
  assessmentId = buildAssessment().id,
  campaignId = buildCampaign().id,
  isShared = faker.random.boolean(),
} = {}) {

  const values = {
    id, assessmentId, campaignId, isShared
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });

  return values;
};

