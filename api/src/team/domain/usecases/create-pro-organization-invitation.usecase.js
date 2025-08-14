import * as injectedOrganizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { organizationInvitationRepository as injectedOrganizationInvitationRepository } from '../../infrastructure/repositories/organization-invitation.repository.js';
import { organizationInvitationService as injectedOrganizationInvitationService } from '../services/organization-invitation.service.js'; /**
 * @param {Object} params
 * @param {string} params.organizationId
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.role
 * @param {string} params.locale
 * @param {OrganizationRepository} params.organizationRepository
 * @param {OrganizationInvitationRepository} params.organizationInvitationRepository
 * @param {OrganizationInvitationService} params.organizationInvitationService
 * @returns {Promise<void>}
 */
const createProOrganizationInvitation = async function ({
  organizationId,
  name,
  email,
  role,
  locale,
  organizationRepository = injectedOrganizationRepository,
  organizationInvitationRepository = injectedOrganizationInvitationRepository,
  organizationInvitationService = injectedOrganizationInvitationService,
} = {}) {
  await organizationInvitationService.createProOrganizationInvitation({
    organizationRepository,
    organizationInvitationRepository,
    organizationId,
    name,
    email,
    role,
    locale,
  });
};

export { createProOrganizationInvitation };
