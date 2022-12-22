const randomString = require('randomstring');
const Membership = require('../models/Membership');
const mailService = require('../../domain/services/mail-service');
const { SendingEmailError, SendingEmailToInvalidDomainError } = require('../errors');

const _generateCode = () => {
  return randomString.generate({ length: 10, capitalization: 'uppercase' });
};

const createOrganizationInvitation = async ({
  organizationRepository,
  organizationInvitationRepository,
  organizationId,
  email,
  locale,
  tags,
  role,
}) => {
  let organizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail({
    organizationId,
    email,
  });

  if (!organizationInvitation) {
    const code = _generateCode();
    organizationInvitation = await organizationInvitationRepository.create({
      organizationId,
      email,
      code,
      role,
    });
  }

  const organization = await organizationRepository.get(organizationId);

  const mailerResponse = await mailService.sendOrganizationInvitationEmail({
    email,
    organizationName: organization.name,
    organizationInvitationId: organizationInvitation.id,
    code: organizationInvitation.code,
    locale,
    tags,
  });
  if (mailerResponse?.status === 'FAILURE') {
    if (mailerResponse.hasFailedBecauseDomainWasInvalid()) {
      throw new SendingEmailToInvalidDomainError(email);
    }

    throw new SendingEmailError();
  }

  return await organizationInvitationRepository.updateModificationDate(organizationInvitation.id);
};

const createProOrganizationInvitation = async ({
  organizationInvitationRepository,
  organizationId,
  email,
  role,
  locale,
  tags,
  name,
}) => {
  let organizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail({
    organizationId,
    email,
  });

  if (!organizationInvitation) {
    const code = _generateCode();
    organizationInvitation = await organizationInvitationRepository.create({ organizationId, email, role, code });
  }

  await mailService.sendOrganizationInvitationEmail({
    email,
    name,
    organizationInvitationId: organizationInvitation.id,
    code: organizationInvitation.code,
    locale,
    tags,
  });

  await organizationInvitationRepository.updateModificationDate(organizationInvitation.id);

  return organizationInvitation;
};

const createScoOrganizationInvitation = async ({
  organizationRepository,
  organizationInvitationRepository,
  organizationId,
  firstName,
  lastName,
  email,
  locale,
  tags,
}) => {
  let organizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail({
    organizationId,
    email,
  });

  if (!organizationInvitation) {
    const code = _generateCode();
    const role = Membership.roles.ADMIN;
    organizationInvitation = await organizationInvitationRepository.create({ organizationId, email, code, role });
  }

  const organization = await organizationRepository.get(organizationId);

  await mailService.sendScoOrganizationInvitationEmail({
    email,
    organizationName: organization.name,
    firstName,
    lastName,
    organizationInvitationId: organizationInvitation.id,
    code: organizationInvitation.code,
    locale,
    tags,
  });

  await organizationInvitationRepository.updateModificationDate(organizationInvitation.id);

  return organizationInvitation;
};

module.exports = {
  createOrganizationInvitation,
  createScoOrganizationInvitation,
  createProOrganizationInvitation,
};
