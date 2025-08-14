import { roles } from '../../../shared/domain/models/Membership.js';
import * as injectedOrganizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js';
import { OrganizationArchivedError } from '../errors.js';

const createMembership = async function ({
  userId,
  organizationId,
  membershipRepository = injectedMembershipRepository,
  organizationRepository = injectedOrganizationRepository,
} = {}) {
  const organization = await organizationRepository.get(organizationId);

  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }

  const memberships = await membershipRepository.findByOrganizationId({ organizationId });
  const organizationRole = memberships.length ? roles.MEMBER : roles.ADMIN;

  return membershipRepository.create(userId, organizationId, organizationRole);
};

export { createMembership };
