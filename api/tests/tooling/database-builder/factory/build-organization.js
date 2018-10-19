const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildOrganization({
  id = faker.random.number(),
  type = 'PRO',
  name = faker.company.companyName(),
  code = 'ABCD12',
  userId = buildUser().id,
  createdAt = faker.date.recent()
} = {}) {

  const values = {
    id, type, name, code, createdAt, userId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  return values;
};

