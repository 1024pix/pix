import { OrganizationMembership } from '../../domain/read-models/OrganizationMembership.js';

import * as injectedOrganizationApi from '../../../../team/application/api/organization.js';

const getByUserIdAndOrganizationId = async ({ userId, organizationId, organizationApi = injectedOrganizationApi } = {}) => {
  const organizationMembership = await organizationApi.getOrganizationMembership({ userId, organizationId });

  return new OrganizationMembership(organizationMembership);
};

export { getByUserIdAndOrganizationId };
