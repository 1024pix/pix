const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildOrganization({
  id = faker.random.number(),
  type = 'PRO',
  name = faker.company.companyName(),
  userId = buildUser().id,
} = {}) {

  const values = {
    id, type, name, userId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  return values;
};

