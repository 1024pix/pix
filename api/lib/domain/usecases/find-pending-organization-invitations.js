export default function findPendingOrganizationInvitations({ organizationId, organizationInvitationRepository }) {
  return organizationInvitationRepository.findPendingByOrganizationId({ organizationId });
}
