const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCenter({
  id,
  name = faker.company.companyName(),
  externalId = faker.random.alphaNumeric(8).toUpperCase(),
  createdAt = faker.date.recent(),
} = {}) {

  const values = {
    id,
    name,
    externalId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-centers',
    values,
  });
};
