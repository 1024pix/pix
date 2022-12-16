const databaseBuffer = require('../database-buffer');
const buildUser = require('./build-user');
const buildOrganization = require('./build-organization');
const Membership = require('../../../lib/domain/models/Membership');
const _ = require('lodash');

module.exports = function buildMembership({
  id = databaseBuffer.getNextId(),
  organizationRole = Membership.roles.MEMBER,
  organizationId,
  userId,
  createdAt = new Date(),
  updatedAt = new Date(),
  disabledAt,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    organizationId,
    organizationRole,
    userId,
    createdAt,
    updatedAt,
    disabledAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'memberships',
    values,
  });
};
