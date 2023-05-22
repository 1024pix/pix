import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';
import { Membership } from '../../domain/models/Membership.js';

const execute = async function (userId, organizationId, type) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId,
    includeOrganization: true,
  });
  if (memberships.length === 0) {
    return false;
  }
  return memberships.some(
    (membership) =>
      membership.organization.isManagingStudents &&
      membership.organization.type === type &&
      membership.organizationRole === Membership.roles.ADMIN
  );
};

export { execute };
