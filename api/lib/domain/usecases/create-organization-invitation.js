const mailService = require('../../domain/services/mail-service');
const { AlreadyExistingOrganizationInvitationError, AlreadyExistingMembershipError } = require('../../domain/errors');

function _checkUserExistWithEmail(userRepository, email) {
  return userRepository.isUserExistingByEmail(email);
}

async function _checkMemberNotExistWithOrganizationIdAndEmail(membershipRepository, organizationId, email) {
  const membershipFound = await membershipRepository.isMembershipExistingByOrganizationIdAndEmail(organizationId, email);
  if (membershipFound) {
    throw new AlreadyExistingMembershipError(`Membership already exists with the organization id ${organizationId} and the email ${email}`);
  }
}

// TODO export to a key/code service
function _generateTemporaryKey() {
  return Math.random().toString(36).substring(2).toUpperCase();
}

module.exports = async function createOrganizationInvitation({
  userRepository, membershipRepository, organizationRepository,
  organizationInvitationRepository, organizationId, email
}) {

  let organizationInvitation;

  await _checkUserExistWithEmail(userRepository, email);
  await _checkMemberNotExistWithOrganizationIdAndEmail(membershipRepository, organizationId, email);

  const organizationInvitationsFound = await organizationInvitationRepository.findByOrganizationIdAndEmail({ organizationId, email });
  if (organizationInvitationsFound.length) {
    organizationInvitation = organizationInvitationsFound[0];
    if (organizationInvitation.isAccepted) {
      throw new AlreadyExistingOrganizationInvitationError(`Invitation already exists with the organization id ${organizationId} and the email ${email}`);
    }
  } else {
    const temporaryKey = _generateTemporaryKey();
    organizationInvitation = await organizationInvitationRepository.create(organizationId, email, temporaryKey);
  }

  const { name: organizationName } = await organizationRepository.get(organizationId);

  await mailService.sendOrganizationInvitationEmail(
    email, organizationName, organizationInvitation.id, organizationInvitation.temporaryKey
  );

  return organizationInvitation;
};
