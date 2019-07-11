const membershipRepository = require('../../infrastructure/repositories/membership-repository');

module.exports = {

  execute(userId, organizationId) {
    return membershipRepository.findByUserIdAndOrganizationId(userId, organizationId)
      .then((memberships) => memberships.reduce((isOwnerInOrganization, membership) => isOwnerInOrganization || membership.isOwner, false));
  }
};
