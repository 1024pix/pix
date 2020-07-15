const randomString = require('randomstring');
const Membership = require('../models/Membership');
const mailService = require('../../domain/services/mail-service');

// TODO Export all functions generating random codes to an appropriate service
const _generateCode = () => {
  return randomString.generate({ length: 10, capitalization: 'uppercase' });
};

const createOrganizationInvitation = async ({
  organizationRepository, organizationInvitationRepository, organizationId, email, locale, tags
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
    locale,
    tags
  });

  await organizationInvitationRepository.updateModificationDate(organizationInvitation.id);

  return organizationInvitation;
};

const createScoOrganizationInvitation = async ({
  organizationRepository, organizationInvitationRepository, organizationId,firstName, lastName, email, locale, tags
}) => {
  let organizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail({ organizationId, email });

  if (!organizationInvitation) {
    const code = _generateCode();
    const role = Membership.roles.ADMIN;
    organizationInvitation = await organizationInvitationRepository.create({ organizationId, email, code, role });
  }

  const { name: organizationName } = await organizationRepository.get(organizationId);

  await mailService.sendScoOrganizationInvitationEmail({
    email,
    organizationName,
    firstName,
    lastName,
    organizationInvitationId: organizationInvitation.id,
    code: organizationInvitation.code,
    locale,
    tags
  });

  await organizationInvitationRepository.updateModificationDate(organizationInvitation.id);

  return organizationInvitation;
};

module.exports = {
  createOrganizationInvitation,
  createScoOrganizationInvitation
};
