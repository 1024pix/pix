const { UncancellableOrganizationInvitationError } = require('../../domain/errors.js');

module.exports = async function cancelOrganizationInvitation({
  organizationInvitationId,
  organizationInvitationRepository,
}) {
  const foundOrganizationInvitation = await organizationInvitationRepository.get(organizationInvitationId);

  if (!foundOrganizationInvitation.isPending) {
    throw new UncancellableOrganizationInvitationError();
  }

  return await organizationInvitationRepository.markAsCancelled({ id: organizationInvitationId });
};
