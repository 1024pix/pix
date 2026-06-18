import { organizationImportRoute } from './application/organization-import-route.js';
import { organizationLearnersRoute } from './application/organization-learners-route.js';
import { scoOrganizationManagementRoute } from './application/sco-organization-management-route.js';
import { supOrganizationManagementRoute } from './application/sup-organization-management-route.js';

const learnerManagementRoutes = [
  supOrganizationManagementRoute,
  scoOrganizationManagementRoute,
  organizationLearnersRoute,
  organizationImportRoute,
];

export { learnerManagementRoutes };
