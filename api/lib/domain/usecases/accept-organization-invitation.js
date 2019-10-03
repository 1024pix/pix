const { AlreadyExistingOrganizationInvitationError } = require('../../domain/errors');

module.exports = function acceptOrganizationInvitation({ organizationInvitationId, organizationInvitationRepository }) {
  return organizationInvitationRepository.get(organizationInvitationId)
    .then((organizationInvitation) => {
      if (organizationInvitation.isAccepted) {
        throw new AlreadyExistingOrganizationInvitationError(`Invitation already exists with the id ${organizationInvitationId}`);
      } else {
        return organizationInvitationRepository.markAsAccepted(organizationInvitationId);
      }
    });

};
