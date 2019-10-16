const { roles } = require('../models/Membership');
const OrganizationInvitation = require('../models/OrganizationInvitation');
const { AlreadyExistingOrganizationInvitationError, AlreadyExistingMembershipError } = require('../../domain/errors');

module.exports = async function answerToOrganizationInvitation({
  organizationInvitationId, code, status,
  userRepository, membershipRepository, organizationInvitationRepository
}) {

  const foundOrganizationInvitation = await organizationInvitationRepository.getByIdAndCode({
    id: organizationInvitationId,
    code
  });

  if (foundOrganizationInvitation.isAccepted) {
    throw new AlreadyExistingOrganizationInvitationError(`Invitation already accepted with the id ${organizationInvitationId}`);
  } else {

    if (status === OrganizationInvitation.StatusType.ACCEPTED) {
      const userFound = await userRepository.findByEmail(foundOrganizationInvitation.email);

      const { organizationId } = foundOrganizationInvitation;
      const memberships = await membershipRepository.findByOrganizationId({ organizationId });

      const isAlreadyMember = memberships.find((membership) => membership.user.id === userFound.id);
      if (isAlreadyMember) {
        throw new AlreadyExistingMembershipError(`User is already member of organisation ${organizationId}`);
      }

      const organizationRole = memberships.length ? roles.MEMBER : roles.OWNER;
      await membershipRepository.create(userFound.id, organizationId, organizationRole);

      return organizationInvitationRepository.markAsAccepted(organizationInvitationId);
    }
  }
};
