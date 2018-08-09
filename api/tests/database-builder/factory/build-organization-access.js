const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildUser({
  id = faker.random.number(),
  userId = faker.random.number(),
  organizationId = faker.random.number(),
} = {}) {

  const values = {
    id, userId, organizationId
  };

  databaseBuffer.pushInsertable({
    tableName: 'organizations-accesses',
    values,
  });

  return values;
};

