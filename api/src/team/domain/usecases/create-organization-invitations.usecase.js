import * as injectedOrganizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { organizationInvitationRepository as injectedOrganizationInvitationRepository } from '../../infrastructure/repositories/organization-invitation.repository.js';
import { OrganizationArchivedError } from '../errors.js';
import { organizationInvitationService as injectedOrganizationInvitationService } from '../services/organization-invitation.service.js';

const createOrganizationInvitations = async function ({
  organizationId,
  emails,
  locale,
  organizationRepository = injectedOrganizationRepository,
  organizationInvitationRepository = injectedOrganizationInvitationRepository,
  organizationInvitationService = injectedOrganizationInvitationService,
} = {}) {
  const organization = await organizationRepository.get(organizationId);

  if (organization.archivedAt) {
    throw new OrganizationArchivedError();
  }

  const trimmedEmails = emails.map((email) => email.trim());
  const uniqueEmails = [...new Set(trimmedEmails)];

  return PromiseUtils.mapSeries(uniqueEmails, async (email) => {
    return organizationInvitationService.createOrUpdateOrganizationInvitation({
      organizationRepository,
      organizationInvitationRepository,
      organizationId,
      email,
      locale,
    });
  });
};

export { createOrganizationInvitations };
