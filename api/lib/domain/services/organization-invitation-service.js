const randomString = require('randomstring');

const mailService = require('../../domain/services/mail-service');

// TODO Export all functions generating random codes to an appropriate service
const _generateCode = () => {
  return randomString.generate({ length: 10, capitalization: 'uppercase' });
};

const createOrganizationInvitation = async ({
  organizationRepository, organizationInvitationRepository, organizationId, email, tags
}) => {
  let organizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail({ organizationId, email });

  if (!organizationInvitation) {
    const code = _generateCode();
    organizationInvitation = await organizationInvitationRepository.create({ organizationId, email, code });
  }

  const { name: organizationName } = await organizationRepository.get(organizationId);

  await mailService.sendOrganizationInvitationEmail({
    email,
    organizationName,
    organizationInvitationId: organizationInvitation.id,
    code: organizationInvitation.code,
    tags
  });

  return organizationInvitation;
};

module.exports = {
  createOrganizationInvitation
};
