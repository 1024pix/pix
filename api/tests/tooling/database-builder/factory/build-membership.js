const databaseBuffer = require('../database-buffer');

module.exports = function buildMembership(
  {
    id,
    organizationId,
    organizationRoleId,
    userId,
  } = {}) {

  const values = { id, organizationId, organizationRoleId, userId };
  return databaseBuffer.pushInsertable({
    tableName: 'memberships',
    values,
  });
};
