const databaseBuffer = require('../database-buffer');
const buildOrganization = require('./build-organization');
const OrganizationInvitation = require('../../../lib/domain/models/OrganizationInvitation');
const _ = require('lodash');

module.exports = function buildOrganizationInvitation({
  id = databaseBuffer.getNextId(),
  organizationId,
  email = 'some.mail@example.net',
  status = OrganizationInvitation.StatusType.PENDING,
  code = 'INVIABC123',
  role,
  updatedAt = new Date('2020-01-01'),
} = {}) {

  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  email = email.toLowerCase();
  role = null;

  const values = {
    id,
    organizationId,
    email,
    status,
    code,
    role,
    createdAt: new Date(),
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'organization-invitations',
    values,
  });
};
