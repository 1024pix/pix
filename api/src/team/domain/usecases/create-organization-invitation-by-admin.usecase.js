import * as injectedOrganizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { organizationInvitationRepository as injectedOrganizationInvitationRepository } from '../../infrastructure/repositories/organization-invitation.repository.js';
import { OrganizationArchivedError } from '../errors.js';
import { organizationInvitationService as injectedOrganizationInvitationService } from '../services/organization-invitation.service.js';

const createOrganizationInvitationByAdmin = async function ({
  organizationId,
  email,
  locale,
  role,
  organizationRepository = injectedOrganizationRepository,
  organizationInvitationRepository = injectedOrganizationInvitationRepository,
  organizationInvitationService = injectedOrganizationInvitationService,
} = {}) {
  const organization = await organizationRepository.get(organizationId);

  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }

  return organizationInvitationService.createOrUpdateOrganizationInvitation({
    organizationId,
    email,
    locale,
    role,
    organizationInvitationRepository,
    organizationRepository,
  });
};

export { createOrganizationInvitationByAdmin };
