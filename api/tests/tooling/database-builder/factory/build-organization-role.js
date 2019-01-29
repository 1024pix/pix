const faker = require('faker');
const databaseBuffer = require('../database-buffer');

const buildOrganizationRole = function buildOrganizationRole({
  id = faker.random.number(),
  name = 'ADMIN',
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

module.exports = buildOrganizationRole;
