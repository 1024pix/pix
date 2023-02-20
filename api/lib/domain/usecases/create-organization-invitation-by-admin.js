import organizationInvitationService from '../services/organization-invitation-service';
import { OrganizationArchivedError } from '../errors';

export default async function createOrganizationInvitationByAdmin({
  organizationId,
  email,
  locale,
  role,
  organizationRepository,
  organizationInvitationRepository,
}) {
  const organization = await organizationRepository.get(organizationId);

  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }

  return organizationInvitationService.createOrUpdateOrganizationInvitation({
    organizationId,
    email,
    locale,
    role,
    organizationInvitationRepository,
    organizationRepository,
  });
}
