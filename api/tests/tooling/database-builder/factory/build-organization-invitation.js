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
    code = faker.random.alphaNumeric(10).toUpperCase(),
  } = {}) {

  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  email = _.isUndefined(email) ? faker.internet.exampleEmail().toLowerCase() : email.toLowerCase();

  const values = {
    id,
    organizationId,
    email,
    status,
    code,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return databaseBuffer.pushInsertable({
    tableName: 'organization-invitations',
    values,
  });
};
