const Membership = require('../../../../lib/domain/models/Membership');
const buildOrganization = require('./build-organization');
const buildOrganizationRole = require('./build-organization-role');

module.exports = function buildMembership(
  {
    id = 1,
    organization = buildOrganization(),
    organizationRole = buildOrganizationRole(),
  } = {}) {

  return new Membership({
    id,
    organization,
    organizationRole,
  });
};
