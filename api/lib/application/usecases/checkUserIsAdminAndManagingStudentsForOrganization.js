import { Membership } from '../../../src/shared/domain/models/Membership.js';
import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';

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
      membership.organizationRole === Membership.roles.ADMIN,
  );
};

export { execute };
