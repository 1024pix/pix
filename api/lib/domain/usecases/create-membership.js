import { roles } from '../models/Membership';
import { OrganizationArchivedError } from '../errors';

export default async function createMembership({
  userId,
  organizationId,
  membershipRepository,
  organizationRepository,
}) {
  const organization = await organizationRepository.get(organizationId);

  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }

  const memberships = await membershipRepository.findByOrganizationId({ organizationId });
  const organizationRole = memberships.length ? roles.MEMBER : roles.ADMIN;

  return membershipRepository.create(userId, organizationId, organizationRole);
}
