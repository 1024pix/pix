const bluebird = require('bluebird');

const organizationInvitationService = require('../../domain/services/organization-invitation-service');

module.exports = async function createOrganizationInvitations({
  organizationRepository, organizationInvitationRepository, organizationId, emails, locale,
}) {
  const trimmedEmails = emails.map((email) => email.trim());
  const uniqueEmails = [...new Set(trimmedEmails)];

  return bluebird.mapSeries(uniqueEmails, (email) => {
    return organizationInvitationService.createOrganizationInvitation({
      organizationRepository, organizationInvitationRepository, organizationId, email, locale,
    });
  });
};

