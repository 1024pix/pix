import { OrganizationNotFoundError } from '../../../src/shared/domain/errors.js';

async function updateOrganizationIdentityProviderForCampaigns({
  identityProviderForCampaigns,
  organizationId,
  organizationForAdminRepository,
  domainTransaction,
}) {
  const existingOrganization = await organizationForAdminRepository.get(organizationId, domainTransaction);

  if (!existingOrganization) {
    throw new OrganizationNotFoundError();
  }
  existingOrganization.updateIdentityProviderForCampaigns(identityProviderForCampaigns);

  await organizationForAdminRepository.update(existingOrganization, domainTransaction);
}

export { updateOrganizationIdentityProviderForCampaigns };
