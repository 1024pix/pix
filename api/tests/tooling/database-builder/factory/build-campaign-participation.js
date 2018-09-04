const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildCampaign = require('./build-campaign');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCampaignParticipation({
  id = faker.random.number(),
  assessmentId = buildAssessment().id,
  campaignId = buildCampaign().id,
} = {}) {

  const values = {
    id, assessmentId, campaignId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });

  return values;
};

