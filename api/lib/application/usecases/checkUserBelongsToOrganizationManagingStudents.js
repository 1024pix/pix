import membershipRepository from '../../infrastructure/repositories/membership-repository';

export default {
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
