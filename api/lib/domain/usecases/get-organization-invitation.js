const { AlreadyExistingInvitationError, CancelledInvitationError } = require('../../domain/errors.js');

module.exports = async function getOrganizationInvitation({
  organizationInvitationId,
  organizationInvitationCode,
  organizationRepository,
  organizationInvitationRepository,
}) {
  const foundOrganizationInvitation = await organizationInvitationRepository.getByIdAndCode({
    id: organizationInvitationId,
    code: organizationInvitationCode,
  });

  if (foundOrganizationInvitation.isCancelled) {
    throw new CancelledInvitationError(`Invitation was cancelled`);
  }

  if (foundOrganizationInvitation.isAccepted) {
    throw new AlreadyExistingInvitationError(`Invitation already accepted with the id ${organizationInvitationId}`);
  }

  const { name: organizationName } = await organizationRepository.get(foundOrganizationInvitation.organizationId);
  foundOrganizationInvitation.organizationName = organizationName;

  return foundOrganizationInvitation;
};
