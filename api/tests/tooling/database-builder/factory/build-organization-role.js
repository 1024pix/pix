const databaseBuffer = require('../database-buffer');

const buildOrganizationRole = function buildOrganizationRole({
  id,
  name = 'ADMIN',
} = {}) {

  const values = {
    id, name,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'organization-roles',
    values,
  });
};

module.exports = buildOrganizationRole;
