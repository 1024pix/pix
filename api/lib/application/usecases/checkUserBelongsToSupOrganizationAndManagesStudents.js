import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';

const execute = async function (userId, organizationId, dependencies = { membershipRepository }) {
  const memberships = await dependencies.membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId,
    includeOrganization: true,
  });

  return memberships.some((membership) => membership.organization.isManagingStudents && membership.organization.isSup);
};

export { execute };
