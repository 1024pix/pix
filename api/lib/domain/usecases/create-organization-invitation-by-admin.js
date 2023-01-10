const organizationInvitationService = require('../services/organization-invitation-service');
const { OrganizationArchivedError } = require('../errors');

module.exports = async function createOrganizationInvitationByAdmin({
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
};
