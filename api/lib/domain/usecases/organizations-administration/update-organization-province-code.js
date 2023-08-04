import { OrganizationNotFoundError } from '../../errors.js';

async function updateOrganizationProvinceCode({ organizationId, provinceCode, organizationForAdminRepository }) {
  const organization = await organizationForAdminRepository.get(organizationId);

  if (!organization) {
    throw new OrganizationNotFoundError();
  }

  organization.updateProvinceCode(provinceCode);

  await organizationForAdminRepository.update(organization);
}

export { updateOrganizationProvinceCode };
