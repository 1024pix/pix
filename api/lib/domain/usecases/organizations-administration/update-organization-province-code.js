import { OrganizationNotFoundError } from '../../errors.js';

async function updateOrganizationProvinceCode({ organizationId, provinceCode, organizationForAdminRepository }) {
  const organization = await organizationForAdminRepository.get(organizationId);

  if (!organization) {
    throw new OrganizationNotFoundError();
  }

  return await organizationForAdminRepository.update({ id: organization.id, provinceCode });
}

export { updateOrganizationProvinceCode };
