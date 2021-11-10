const organizationInvitationService = require('../services/organization-invitation-service');

module.exports = async function createOrganizationInvitationByAdmin({
  organizationId,
  email,
  locale,
  role,
  organizationRepository,
  organizationInvitationRepository,
}) {
  return organizationInvitationService.createOrganizationInvitation({
    organizationId,
    email,
    locale,
    role,
    organizationInvitationRepository,
    organizationRepository,
  });
};
