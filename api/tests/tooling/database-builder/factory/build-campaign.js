const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildCampaign({
  id = faker.random.number(),
  name = faker.company.companyName(),
  idPixLabel = faker.company.companyName(),
  code = faker.random.alphaNumeric(9),
  createdAt = faker.date.recent(),
  organizationId = faker.random.number(),
  creatorId = faker.random.number(),
  targetProfileId = faker.random.number(),
} = {}) {

  const values = {
    id, name, idPixLabel, code, createdAt, organizationId, creatorId, targetProfileId
  };

  databaseBuffer.pushInsertable({
    tableName: 'campaigns',
    values,
  });

  return values;
};
