import { Organization } from '../../models/index.js';

const getOrganizationDetails = async function ({ organizationId, organizationForAdminRepository, schoolRepository }) {
  const organization = await organizationForAdminRepository.get(organizationId);
  if (organization.type === Organization.types.SCO1D) {
    organization.code = await schoolRepository.getById(organization.id);
  }
  return organization;
};

export { getOrganizationDetails };
