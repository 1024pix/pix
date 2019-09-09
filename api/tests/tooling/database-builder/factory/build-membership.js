const databaseBuffer = require('../database-buffer');
const buildUser = require('./build-user');
const buildOrganization = require('./build-organization');
const Membership = require('../../../../lib/domain/models/Membership');
const _ = require('lodash');

module.exports = function buildMembership(
  {
    id,
    organizationRole = Membership.roles.MEMBER,
    organizationId,
    userId,
  } = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    organizationId,
    organizationRole,
    userId
  };
  return databaseBuffer.pushInsertable({
    tableName: 'memberships',
    values,
  });
};
