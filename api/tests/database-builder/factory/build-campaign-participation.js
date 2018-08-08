const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildOrganization({
  id = faker.random.number(),
  assessmentId = faker.random.number(),
  campaignId = faker.random.number(),
} = {}) {

  const values = {
    id, assessmentId, campaignId
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaign-participations',
    values,
  });

  return values;
};

