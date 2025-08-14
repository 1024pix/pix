import * as injectedOrganizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { organizationInvitationRepository as injectedOrganizationInvitationRepository } from '../../infrastructure/repositories/organization-invitation.repository.js';
import { organizationInvitationService as injectedOrganizationInvitationService } from '../services/organization-invitation.service.js';
const resendOrganizationInvitation = async function ({
  email,
  organizationId,
  organizationRepository = injectedOrganizationRepository,
  organizationInvitationRepository = injectedOrganizationInvitationRepository,
  organizationInvitationService = injectedOrganizationInvitationService,
} = {}) {
  return organizationInvitationService.createOrUpdateOrganizationInvitation({
    email,
    organizationId,
    organizationRepository,
    organizationInvitationRepository,
  });
};

export { resendOrganizationInvitation };
