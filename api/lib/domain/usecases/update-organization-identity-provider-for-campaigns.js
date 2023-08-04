import { OrganizationNotFoundError } from '../errors.js';

async function updateOrganizationIdentityProviderForCampaigns({
  identityProviderForCampaigns,
  organizationId,
  organizationForAdminRepository,
}) {
  const existingOrganization = await organizationForAdminRepository.get(organizationId);

  if (!existingOrganization) {
    throw new OrganizationNotFoundError();
  }
  existingOrganization.updateIdentityProviderForCampaigns(identityProviderForCampaigns);

  await organizationForAdminRepository.update(existingOrganization);
}

export { updateOrganizationIdentityProviderForCampaigns };
