import { Organization } from '../models/Organization.js';

const getOrganizationDetails = async function ({ organizationId, organizationForAdminRepository, schoolRepository }) {
  const organization = await organizationForAdminRepository.get(organizationId);
  if (organization.type === Organization.types.SCO1D) {
    organization.code = await schoolRepository.getById({ organizationId });
  }
  return organization;
};

export { getOrganizationDetails };
