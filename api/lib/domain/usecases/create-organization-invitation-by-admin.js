const organizationInvitationService = require('../services/organization-invitation-service');
const { OrganizationArchivedError } = require('../errors');

module.exports = async function createOrganizationInvitationByAdmin({
  organizationId,
  email,
  locale,
  role,
  organizationRepository,
  membershipRepository,
  organizationInvitationRepository,
}) {
  const organization = await organizationRepository.get(organizationId);

  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }

  return organizationInvitationService.createOrganizationInvitation({
    organizationId,
    email,
    locale,
    role,
    organizationRepository,
    membershipRepository,
    organizationInvitationRepository,
  });
};
