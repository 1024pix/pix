const databaseBuffer = require('../database-buffer');
const Membership = require('../../../../lib/domain/models/Membership');

module.exports = function buildMembership(
  {
    id,
    organizationRole = Membership.roles.MEMBER,
    organizationId,
    userId,
  } = {}) {

  const values = { id, organizationId, organizationRole, userId };
  return databaseBuffer.pushInsertable({
    tableName: 'memberships',
    values,
  });
};
