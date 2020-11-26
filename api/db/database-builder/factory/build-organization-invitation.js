const databaseBuffer = require('../database-buffer');
const buildOrganization = require('./build-organization');
const OrganizationInvitation = require('../../../lib/domain/models/OrganizationInvitation');
const _ = require('lodash');
const faker = require('faker');

module.exports = function buildOrganizationInvitation(
  {
    id,
    organizationId,
    email,
    status = OrganizationInvitation.StatusType.PENDING,
    code = faker.random.alphaNumeric(10).toUpperCase(),
    role,
    updatedAt = new Date(),
  } = {}) {

  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  email = _.isUndefined(email) ? faker.internet.exampleEmail().toLowerCase() : email.toLowerCase();
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
