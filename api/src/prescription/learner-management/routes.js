import * as organizationLearners from './application/organization-learners-route.js';
import * as scoOrganizationManangement from './application/sco-organization-management-route.js';
import * as supOrganizationManangement from './application/sup-organization-management-route.js';

const learnerManagementRoutes = [supOrganizationManangement, scoOrganizationManangement, organizationLearners];

export { learnerManagementRoutes };
