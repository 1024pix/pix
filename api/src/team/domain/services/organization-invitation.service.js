import randomString from 'randomstring';

import {
  SendingEmailError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
} from '../../../../lib/domain/errors.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import * as mailService from '../../../../lib/domain/services/mail-service.js';

/**
 * @param {Object} params
 * @param {OrganizationRepository} params.organizationRepository
 * @param {OrganizationInvitationRepository} params.organizationInvitationRepository
 * @param {string} params.organizationId
 * @param {string} params.email
 * @param {string} params.locale
 * @param {*[]} params.tags
 * @param {string} params.role
 * @param {Object} params.dependencies
 * @returns {Promise<*>}
 */
const createOrUpdateOrganizationInvitation = async ({
  organizationRepository,
  organizationInvitationRepository,
  organizationId,
  email,
  locale,
  tags,
  role,
  dependencies = { mailService },
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

  const mailerResponse = await dependencies.mailService.sendOrganizationInvitationEmail({
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

    if (mailerResponse.hasFailedBecauseEmailWasInvalid()) {
      throw new SendingEmailToInvalidEmailAddressError(email, mailerResponse.errorMessage);
    }

    throw new SendingEmailError();
  }

  return await organizationInvitationRepository.updateModificationDate(organizationInvitation.id);
};

/**
 * @param {Object} params
 * @param {OrganizationInvitationRepository} params.organizationInvitationRepository
 * @param {string} params.organizationId
 * @param {string} params.email
 * @param {string} params.locale
 * @param {*[]} params.tags
 * @param {string} params.name
 * @param {string} params.role
 * @param {Object} params.dependencies
 * @returns {Promise<*>}
 */
const createProOrganizationInvitation = async ({
  organizationInvitationRepository,
  organizationId,
  email,
  role,
  locale,
  tags,
  name,
  dependencies = { mailService },
}) => {
  let organizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail({
    organizationId,
    email,
  });

  if (!organizationInvitation) {
    const code = _generateCode();
    organizationInvitation = await organizationInvitationRepository.create({ organizationId, email, role, code });
  }

  await dependencies.mailService.sendOrganizationInvitationEmail({
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

/**
 * @param {Object} params
 * @param {OrganizationRepository} params.organizationRepository
 * @param {OrganizationInvitationRepository} params.organizationInvitationRepository
 * @param {string} params.organizationId
 * @param {string} params.email
 * @param {string} params.locale
 * @param {*[]} params.tags
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {Object} params.dependencies
 * @returns {Promise<*>}
 */
const createScoOrganizationInvitation = async ({
  organizationRepository,
  organizationInvitationRepository,
  organizationId,
  firstName,
  lastName,
  email,
  locale,
  tags,
  dependencies = { mailService },
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

  await dependencies.mailService.sendScoOrganizationInvitationEmail({
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

export const organizationInvitationService = {
  createOrUpdateOrganizationInvitation,
  createProOrganizationInvitation,
  createScoOrganizationInvitation,
};

const _generateCode = () => {
  return randomString.generate({ length: 10, capitalization: 'uppercase' });
};
