const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildCampaign({
  id = faker.random.number(),
  name = faker.company.companyName(),
  code = 'AZERTY123',
  createdAt = faker.date.recent(),
  creatorId = faker.random.number(2),
  organizationId = faker.random.number(2),
  targetProfileId = faker.random.number(2),
} = {}) {

  const values = {
    id, name, code, createdAt, creatorId, organizationId, targetProfileId
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaigns',
    values,
  });

  return values;
};
