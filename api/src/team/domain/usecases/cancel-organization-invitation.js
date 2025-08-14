import { organizationInvitationRepository as injectedOrganizationInvitationRepository } from '../../infrastructure/repositories/organization-invitation.repository.js';
import { UncancellableOrganizationInvitationError } from '../errors.js';

const cancelOrganizationInvitation = async function ({
  organizationInvitationId,
  organizationInvitationRepository = injectedOrganizationInvitationRepository,
} = {}) {
  const foundOrganizationInvitation = await organizationInvitationRepository.get(organizationInvitationId);

  if (!foundOrganizationInvitation.isPending) {
    throw new UncancellableOrganizationInvitationError();
  }

  return await organizationInvitationRepository.markAsCancelled({ id: organizationInvitationId });
};

export { cancelOrganizationInvitation };
