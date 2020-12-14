const membershipRepository = require('../../infrastructure/repositories/membership-repository');
const Membership = require('../../domain/models/Membership');

module.exports = {

  async execute(userId, organizationId, type) {
    const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization: true });
    if (memberships.length === 0) {
      return false;
    }
    return memberships.some((membership) =>
      membership.organization.isManagingStudents
        && membership.organization.type === type
        && membership.organizationRole === Membership.roles.ADMIN,
    );
  },
};
