import { OrganizationArchivedError } from '../../../shared/domain/errors.js';
import { roles } from '../../../shared/domain/models/Membership.js';

const createMembership = async function ({ userId, organizationId, membershipRepository, organizationRepository }) {
  const organization = await organizationRepository.get(organizationId);

  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }

  const memberships = await membershipRepository.findByOrganizationId({ organizationId });
  const organizationRole = memberships.length ? roles.MEMBER : roles.ADMIN;

  return membershipRepository.create(userId, organizationId, organizationRole);
};

export { createMembership };
