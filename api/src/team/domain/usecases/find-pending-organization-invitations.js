const findPendingOrganizationInvitations = function ({ organizationId, organizationInvitationRepository }) {
  return organizationInvitationRepository.findPendingByOrganizationId({ organizationId });
};

export { findPendingOrganizationInvitations };
