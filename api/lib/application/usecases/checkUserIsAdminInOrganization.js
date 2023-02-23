const membershipRepository = require('../../infrastructure/repositories/membership-repository.js');

module.exports = {
  execute(userId, organizationId) {
    return membershipRepository
      .findByUserIdAndOrganizationId({ userId, organizationId })
      .then((memberships) =>
        memberships.reduce((isAdminInOrganization, membership) => isAdminInOrganization || membership.isAdmin, false)
      );
  },
};
