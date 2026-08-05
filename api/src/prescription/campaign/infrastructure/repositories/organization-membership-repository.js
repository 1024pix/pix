import * as teamOrganizationApi from '../../../../team/application/api/organization.js';
import { OrganizationMembership } from '../../domain/read-models/OrganizationMembership.js';

const getByUserIdAndOrganizationId = async ({ userId, organizationId, organizationApi = teamOrganizationApi }) => {
  const organizationMembership = await organizationApi.getOrganizationMembership({ userId, organizationId });

  return new OrganizationMembership(organizationMembership);
};

export { getByUserIdAndOrganizationId };
