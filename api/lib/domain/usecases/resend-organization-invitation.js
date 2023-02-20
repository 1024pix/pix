import organizationInvitationService from '../../domain/services/organization-invitation-service';

export default async function resendOrganizationInvitation({
  organizationId,
  email,
  locale,
  organizationRepository,
  organizationInvitationRepository,
}) {
  return organizationInvitationService.createOrUpdateOrganizationInvitation({
    organizationRepository,
    organizationInvitationRepository,
    organizationId,
    email,
    locale,
  });
}
