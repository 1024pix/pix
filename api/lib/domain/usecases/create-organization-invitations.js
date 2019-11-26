const organizationInvitationService = require('../../domain/services/organization-invitation-service');

module.exports = async function createOrganizationInvitations({
  membershipRepository, organizationRepository, organizationInvitationRepository, organizationId, emails
}) {
  const organizationInvitations = emails.map((email) => {
    return organizationInvitationService.createOrganizationInvitation({
      membershipRepository, organizationRepository, organizationInvitationRepository, organizationId, email
    });
  });
  return Promise.all(organizationInvitations);
};

