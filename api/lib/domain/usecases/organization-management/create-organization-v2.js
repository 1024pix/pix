const OrganizationForAdmin = require('../../models/OrganizationForAdmin_v2');

module.exports = function createOrganization({ organizationCreationCommand }) {
  return OrganizationForAdmin.create(organizationCreationCommand);
};
