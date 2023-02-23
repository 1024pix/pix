const membershipRepository = require('../../infrastructure/repositories/membership-repository.js');

module.exports = {
  async execute(userId, organizationId) {
    const memberships = await membershipRepository.findByUserIdAndOrganizationId({
      userId,
      organizationId,
      includeOrganization: true,
    });

    return memberships.some(
      (membership) => membership.organization.isManagingStudents && membership.organization.isSco
    );
  },
};
