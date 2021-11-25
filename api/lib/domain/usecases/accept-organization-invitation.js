const { roles } = require('../models/Membership');
const { AlreadyExistingOrganizationInvitationError, AlreadyExistingMembershipError } = require('../../domain/errors');
const _ = require('lodash');

function _pickDefaultRole(existingMemberships) {
  return _.isEmpty(existingMemberships) ? roles.ADMIN : roles.MEMBER;
}

module.exports = async function acceptOrganizationInvitation({
  organizationInvitationId,
  code,
  email,
  userRepository,
  membershipRepository,
  organizationInvitationRepository,
  userOrgaSettingsRepository,
}) {
  const foundOrganizationInvitation = await organizationInvitationRepository.getByIdAndCode({
    id: organizationInvitationId,
    code,
  });

  if (foundOrganizationInvitation.isAccepted) {
    throw new AlreadyExistingOrganizationInvitationError(
      `Invitation already accepted with the id ${organizationInvitationId}`
    );
  } else {
    const userFound = await userRepository.getByEmail(email);

    const { organizationId, role: invitationRole } = foundOrganizationInvitation;
    const memberships = await membershipRepository.findByOrganizationId({ organizationId });
    const existingMembership = memberships.find((membership) => membership.user.id === userFound.id);

    if (existingMembership && !invitationRole) {
      await organizationInvitationRepository.markAsAccepted(organizationInvitationId);

      throw new AlreadyExistingMembershipError(`User is already member of organisation ${organizationId}`);
    }

    let membership;

    if (existingMembership) {
      membership = await membershipRepository.updateById({
        id: existingMembership.id,
        membership: { organizationRole: invitationRole },
      });
    } else {
      const organizationRole = invitationRole || _pickDefaultRole(memberships);
      membership = await membershipRepository.create(userFound.id, organizationId, organizationRole);
    }

    await userOrgaSettingsRepository.createOrUpdate({ userId: userFound.id, organizationId });

    await organizationInvitationRepository.markAsAccepted(organizationInvitationId);

    return membership;
  }
};
