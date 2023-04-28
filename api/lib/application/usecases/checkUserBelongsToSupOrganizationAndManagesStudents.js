const membershipRepository = require('../../infrastructure/repositories/membership-repository.js');

module.exports = {
  async execute(userId, organizationId, dependencies = { membershipRepository }) {
    const memberships = await dependencies.membershipRepository.findByUserIdAndOrganizationId({
      userId,
      organizationId,
      includeOrganization: true,
    });

    return memberships.some(
      (membership) => membership.organization.isManagingStudents && membership.organization.isSup
    );
  },
};
