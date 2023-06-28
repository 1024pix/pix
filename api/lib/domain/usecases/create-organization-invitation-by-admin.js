import { OrganizationArchivedError } from '../../../src/shared/domain/errors.js';

const createOrganizationInvitationByAdmin = async function ({
  organizationId,
  email,
  locale,
  role,
  organizationRepository,
  organizationInvitationRepository,
  organizationInvitationService,
}) {
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
