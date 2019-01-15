const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCenter({
  id = faker.random.number(),
  name = faker.company.companyName(),
  createdAt = faker.date.recent(),
} = {}) {

  const values = {
    id,
    name,
    createdAt,
  };

  databaseBuffer.pushInsertable({
    tableName: 'certification-centers',
    values,
  });

  return values;
};
