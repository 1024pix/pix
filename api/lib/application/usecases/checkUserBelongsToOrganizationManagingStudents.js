const membershipRepository = require('../../infrastructure/repositories/membership-repository.js');

module.exports = {
  async execute(userId, organizationId) {
    const memberships = await membershipRepository.findByUserIdAndOrganizationId({
      userId,
      organizationId,
      includeOrganization: true,
    });
    return memberships.reduce(
      (belongsToScoOrganization, membership) => belongsToScoOrganization || membership.organization.isManagingStudents,
      false
    );
  },
};
