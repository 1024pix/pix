const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildOrganization({
  id = faker.random.number(),
  name = faker.random.word(),
} = {}) {

  const values = {
    id, name,
  };

  databaseBuffer.pushInsertable({
    tableName: 'organization-roles',
    values,
  });

  return values;
};

