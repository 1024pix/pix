import { UncancellableOrganizationInvitationError } from '../../domain/errors.js';

const cancelOrganizationInvitation = async function ({ organizationInvitationId, organizationInvitationRepository }) {
  const foundOrganizationInvitation = await organizationInvitationRepository.get(organizationInvitationId);

  if (!foundOrganizationInvitation.isPending) {
    throw new UncancellableOrganizationInvitationError();
  }

  return await organizationInvitationRepository.markAsCancelled({ id: organizationInvitationId });
};

export { cancelOrganizationInvitation };
