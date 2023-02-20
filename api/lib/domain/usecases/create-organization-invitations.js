import bluebird from 'bluebird';
import organizationInvitationService from '../../domain/services/organization-invitation-service';
import { OrganizationArchivedError } from '../errors';

export default async function createOrganizationInvitations({
  organizationId,
  emails,
  locale,
  organizationRepository,
  organizationInvitationRepository,
}) {
  const organization = await organizationRepository.get(organizationId);

  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }

  const trimmedEmails = emails.map((email) => email.trim());
  const uniqueEmails = [...new Set(trimmedEmails)];

  return bluebird.mapSeries(uniqueEmails, (email) => {
    return organizationInvitationService.createOrUpdateOrganizationInvitation({
      organizationRepository,
      organizationInvitationRepository,
      organizationId,
      email,
      locale,
    });
  });
}
