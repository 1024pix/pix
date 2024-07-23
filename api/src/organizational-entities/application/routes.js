import * as certificationCenterAdminRoutes from './certification-center/certification-center.admin.route.js';
import * as organizationAdminRoutes from './organization/organization.admin.route.js';

const organizationalEntitiesRoutes = [organizationAdminRoutes, certificationCenterAdminRoutes];

export { organizationalEntitiesRoutes };
