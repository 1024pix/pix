import membershipRepository from '../../infrastructure/repositories/membership-repository';

export default {
  execute(userId, organizationId) {
    return membershipRepository
      .findByUserIdAndOrganizationId({ userId, organizationId })
      .then((memberships) =>
        memberships.reduce((isAdminInOrganization, membership) => isAdminInOrganization || membership.isAdmin, false)
      );
  },
};
