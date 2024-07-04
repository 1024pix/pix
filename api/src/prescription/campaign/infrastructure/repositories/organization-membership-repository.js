import { OrganizationMembership } from '../../domain/read-models/OrganizationMembership.js';

const getByUserIdAndOrganizationId = async ({ userId, organizationId, organizationApi }) => {
  const organizationMembership = await organizationApi.getOrganizationMembership({ userId, organizationId });

  return new OrganizationMembership(organizationMembership);
};

export { getByUserIdAndOrganizationId };
