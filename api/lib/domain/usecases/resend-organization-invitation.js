module.exports = async function resendOrganizationInvitation({
  organizationId,
  email,
  locale,
  organizationRepository,
  organizationInvitationRepository,
  organizationInvitationService,
}) {
  return organizationInvitationService.createOrUpdateOrganizationInvitation({
    organizationRepository,
    organizationInvitationRepository,
    organizationId,
    email,
    locale,
  });
};
