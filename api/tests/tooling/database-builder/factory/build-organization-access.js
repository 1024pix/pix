const buildUser = require('./build-user');
const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildOrganizationAccess({
  id = faker.random.number(),
  userId = buildUser().id,
  organizationId = buildOrganization().id,
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

