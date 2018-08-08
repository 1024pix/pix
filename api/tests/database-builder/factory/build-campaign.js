const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildCampaign({
  id = faker.random.number(),
  name = faker.company.companyName(),
  code = faker.company.companyName(),
  organizationId = faker.random.number(),
  creatorId = faker.random.number(),
  targetProfileId = faker.random.number(),
} = {}) {

  const values = {
    id, name, code, organizationId, creatorId, targetProfileId
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaigns',
    values,
  });

  return values;
};

