const organizationInvitationService = require('../../domain/services/organization-invitation-service');

module.exports = async function resendOrganizationInvitation({
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
};
