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

async function _checkOrganizationInvitationNotExistsWithOrganizationIdAndEmail(organizationInvitationRepository, organizationId, email) {
  const organizationInvitationsFound = await organizationInvitationRepository.findByOrganizationIdAndEmail({ organizationId, email });
  if (organizationInvitationsFound.length) {
    throw new AlreadyExistingOrganizationInvitationError(`Invitation already exists with the organization id ${organizationId} and the email ${email}`);
  }
}

module.exports = async function createOrganizationInvitation({ userRepository, membershipRepository, organizationInvitationRepository, organizationId, email }) {

  await _checkUserExistWithEmail(userRepository, email);
  await _checkMemberNotExistWithOrganizationIdAndEmail(membershipRepository, organizationId, email);
  await _checkOrganizationInvitationNotExistsWithOrganizationIdAndEmail(organizationInvitationRepository, organizationId, email);

  return organizationInvitationRepository.create(organizationId, email);
};
