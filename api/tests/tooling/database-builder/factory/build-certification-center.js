const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCenter({
  id,
  name = faker.company.companyName(),
  createdAt = faker.date.recent(),
} = {}) {

  const values = {
    id,
    name,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-centers',
    values,
  });
};
