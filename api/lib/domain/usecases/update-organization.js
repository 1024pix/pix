import { OrganizationNotFoundError } from '../errors.js';

async function updateOrganization({ organization, organizationForAdminRepository }) {
  const existingOrganization = await organizationForAdminRepository.get(organization.id);

  if (!existingOrganization) {
    throw new OrganizationNotFoundError();
  }

  return await organizationForAdminRepository.update(organization);
}

export { updateOrganization };
