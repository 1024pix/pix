import { organizationInvitationRepository as injectedOrganizationInvitationRepository } from '../../infrastructure/repositories/organization-invitation.repository.js';
const findPendingOrganizationInvitations = function ({
  organizationId,
  organizationInvitationRepository = injectedOrganizationInvitationRepository,
} = {}) {
  return organizationInvitationRepository.findPendingByOrganizationId({ organizationId });
};

export { findPendingOrganizationInvitations };
