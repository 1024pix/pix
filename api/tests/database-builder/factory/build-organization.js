const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildOrganization({
  id = faker.random.number(),
  email = faker.internet.email(),
  type = 'PRO',
  name = faker.company.companyName(),
  userId = faker.random.number(),
} = {}) {

  const values = {
    id, email, type, name, userId
  };

  databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  return values;
};

