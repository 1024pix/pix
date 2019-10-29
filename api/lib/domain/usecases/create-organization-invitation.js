const randomString = require('randomstring');
const mailService = require('../../domain/services/mail-service');
const { AlreadyExistingOrganizationInvitationError, AlreadyExistingMembershipError } = require('../../domain/errors');

async function _checkMemberNotExistWithOrganizationIdAndEmail({ membershipRepository, organizationId, email }) {
  const membershipFound = await membershipRepository.isMembershipExistingByOrganizationIdAndEmail(organizationId, email);
  if (membershipFound) {
    throw new AlreadyExistingMembershipError(`Membership already exists with the organization id ${organizationId} and the email ${email}`);
  }
}

// TODO Export all functions generating random codes to an appropriate service
function _generateCode() {
  return randomString.generate({ length: 10, capitalization: 'uppercase' });
}

module.exports = async function createOrganizationInvitation({
  membershipRepository, organizationRepository,
  organizationInvitationRepository, organizationId, email
}) {

  await _checkMemberNotExistWithOrganizationIdAndEmail({ membershipRepository, organizationId, email });

  let organizationInvitation = await organizationInvitationRepository.findOneByOrganizationIdAndEmail({ organizationId, email });
  if (organizationInvitation) {
    if (organizationInvitation.isAccepted) {
      throw new AlreadyExistingOrganizationInvitationError(`Invitation already accepted with the organization id ${organizationId} and the email ${email}`);
    }
  } else {
    const code = _generateCode();
    organizationInvitation = await organizationInvitationRepository.create({ organizationId, email, code });
  }

  const { name: organizationName } = await organizationRepository.get(organizationId);

  await mailService.sendOrganizationInvitationEmail({
    email,
    organizationName,
    organizationInvitationId: organizationInvitation.id,
    code: organizationInvitation.code
  });

  return organizationInvitation;
};
