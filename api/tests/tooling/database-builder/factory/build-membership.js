const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildMembership(
  {
    id = faker.random.number(),
    organizationId,
    organizationRoleId,
    userId,
  } = {}) {

  const values = { id, organizationId, organizationRoleId, userId };

  databaseBuffer.pushInsertable({
    tableName: 'memberships',
    values,
  });

  return values;
};
