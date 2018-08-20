const OrganizationAccess = require('../../../lib/domain/models/OrganizationAccess');
const buildOrganization = require('./build-organization');
const buildOrganizationRole = require('./build-organization-role');

module.exports = function buildOrganizationAccess(
  {
    id = 1,
    organization = buildOrganization(),
    organizationRole = buildOrganizationRole(),
  } = {}) {

  return new OrganizationAccess({
    id,
    organization,
    organizationRole,
  });
};
