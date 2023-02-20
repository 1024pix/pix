import { UncancellableOrganizationInvitationError } from '../../domain/errors';

export default async function cancelOrganizationInvitation({
  organizationInvitationId,
  organizationInvitationRepository,
}) {
  const foundOrganizationInvitation = await organizationInvitationRepository.get(organizationInvitationId);

  if (!foundOrganizationInvitation.isPending) {
    throw new UncancellableOrganizationInvitationError();
  }

  return await organizationInvitationRepository.markAsCancelled({ id: organizationInvitationId });
}
