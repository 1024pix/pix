import { OrganizationNotFoundError } from '../../errors.js';

async function updateOrganizationProvinceCode({
  organizationId,
  provinceCode,
  organizationForAdminRepository,
  domainTransaction,
}) {
  const organization = await organizationForAdminRepository.get(organizationId, domainTransaction);

  if (!organization) {
    throw new OrganizationNotFoundError();
  }

  organization.updateProvinceCode(provinceCode);

  await organizationForAdminRepository.update(organization, domainTransaction);
}

export { updateOrganizationProvinceCode };
