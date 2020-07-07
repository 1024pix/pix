const { roles } = require('../models/Membership');
const { AlreadyExistingOrganizationInvitationError, AlreadyExistingMembershipError } = require('../../domain/errors');

function getOrganizationRole({ hasMembers, invitationRole }) {
  return invitationRole || (hasMembers ? roles.MEMBER : roles.ADMIN);
}

module.exports = async function acceptOrganizationInvitation({
  organizationInvitationId, code, email,
  userRepository, membershipRepository, organizationInvitationRepository
}) {
  const foundOrganizationInvitation = await organizationInvitationRepository.getByIdAndCode({
    id: organizationInvitationId,
    code
  });

  if (foundOrganizationInvitation.isAccepted) {
    throw new AlreadyExistingOrganizationInvitationError(`Invitation already accepted with the id ${organizationInvitationId}`);
  } else {

    const userFound = await userRepository.findByEmail(email);

    const { organizationId, role: invitationRole } = foundOrganizationInvitation;
    const memberships = await membershipRepository.findByOrganizationId({ organizationId });
    const existingMembership = memberships.find((membership) => membership.user.id === userFound.id);

    if (existingMembership && !invitationRole) {
      throw new AlreadyExistingMembershipError(`User is already member of organisation ${organizationId}`);
    }

    if (existingMembership) {
      await membershipRepository.updateById({ id: existingMembership.id, membershipAttributes: { organizationRole: invitationRole } });
    } else {
      const organizationRole = getOrganizationRole({ hasMembers: memberships.length, invitationRole });
      await membershipRepository.create(userFound.id, organizationId, organizationRole);
    }

    return organizationInvitationRepository.markAsAccepted(organizationInvitationId);
  }

};
