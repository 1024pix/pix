const { roles } = require('../models/Membership');
const OrganizationInvitation = require('../models/OrganizationInvitation');
const { AlreadyExistingOrganizationInvitationError, AlreadyExistingMembershipError } = require('../../domain/errors');

module.exports = async function answerToOrganizationInvitation({
  organizationInvitationId, temporaryKey, status,
  userRepository, membershipRepository, organizationInvitationRepository
}) {

  const organizationInvitationFound = await organizationInvitationRepository.getByIdAndTemporaryKey({
    id: organizationInvitationId,
    temporaryKey
  });

  if (organizationInvitationFound.isAccepted) {
    throw new AlreadyExistingOrganizationInvitationError(`Invitation already accepted with the id ${organizationInvitationId}`);
  } else {

    // TODO traitement du status
    if (status === OrganizationInvitation.StatusType.ACCEPTED) {
      const userFound = await userRepository.findByEmail(organizationInvitationFound.email);

      const { organizationId } = organizationInvitationFound;
      const memberships = await membershipRepository.findByOrganizationId({ organizationId });

      const isAlreadyMember = memberships.find((membership) => membership.user.id === userFound.id);
      if (isAlreadyMember) {
        throw new AlreadyExistingMembershipError(`User is already member of organisation ${organizationId}`);
      }

      const organizationRole = memberships.length ? roles.MEMBER : roles.OWNER;
      await membershipRepository.create(userFound.id, organizationId, organizationRole);

      return organizationInvitationRepository.markAsAccepted(organizationInvitationId);
    }
    return;
  }
};
