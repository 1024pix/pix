const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildOrganization({
  id = faker.random.number(),
  email = faker.internet.email(),
  type = 'PRO',
  name = faker.company.companyName(),
  code = faker.random.word(),
  userId = buildUser().id,
} = {}) {

  const values = {
    id, email, type, name, code, userId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  return values;
};

