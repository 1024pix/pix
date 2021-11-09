const { UncancellableOrganizationInvitationError } = require('../../domain/errors');

module.exports = async function cancelOrganizationInvitation({
  organizationInvitationId,
  organizationInvitationRepository,
}) {
  const foundOrganizationInvitation = await organizationInvitationRepository.get(organizationInvitationId);

  if (!foundOrganizationInvitation.isPending) {
    throw new UncancellableOrganizationInvitationError();
  }

  await organizationInvitationRepository.markAsCancelled({ id: organizationInvitationId });
  return await organizationInvitationRepository.updateModificationDate(organizationInvitationId);
};
