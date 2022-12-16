module.exports = function findPendingOrganizationInvitations({ organizationId, organizationInvitationRepository }) {
  return organizationInvitationRepository.findPendingByOrganizationId({ organizationId });
};
