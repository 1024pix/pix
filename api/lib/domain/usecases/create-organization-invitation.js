const randomString = require('randomstring');
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

// TODO Export all functions generating random codes to an appropriate service
function _generateTemporaryKey() {
  return randomString.generate({ length: 10, capitalization: 'uppercase' });
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
      throw new AlreadyExistingOrganizationInvitationError(`Invitation already accepted with the organization id ${organizationId} and the email ${email}`);
    }
  } else {
    const temporaryKey = _generateTemporaryKey();
    organizationInvitation = await organizationInvitationRepository.create({ organizationId, email, temporaryKey });
  }

  const { name: organizationName } = await organizationRepository.get(organizationId);

  await mailService.sendOrganizationInvitationEmail({
    email,
    organizationName,
    organizationInvitationId: organizationInvitation.id,
    temporaryKey: organizationInvitation.temporaryKey
  });

  return organizationInvitation;
};
