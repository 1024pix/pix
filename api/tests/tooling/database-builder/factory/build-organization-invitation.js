const databaseBuffer = require('../database-buffer');
const buildOrganization = require('./build-organization');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const _ = require('lodash');
const faker = require('faker');

module.exports = function buildOrganizationInvitation(
  {
    id,
    organizationId,
    email,
    status = OrganizationInvitation.StatusType.PENDING,
    temporaryKey = faker.random.alphaNumeric(10),
  } = {}) {

  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  email = _.isUndefined(email) ? faker.internet.exampleEmail().toLowerCase() : email.toLowerCase();

  const values = {
    id,
    organizationId,
    email,
    status,
    temporaryKey,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'organization-invitations',
    values,
  });
};
