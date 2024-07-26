import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';

const execute = function (userId, organizationId, dependencies = { membershipRepository }) {
  return dependencies.membershipRepository
    .findByUserIdAndOrganizationId({ userId, organizationId })
    .then((memberships) =>
      memberships.reduce((isAdminInOrganization, membership) => isAdminInOrganization || membership.isAdmin, false),
    );
};

export { execute };
