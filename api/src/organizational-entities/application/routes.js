import * as certificationCenterAdminRoutes from './certification-center/certification-center.admin.route.js';
import * as organizationAdminRoutes from './organization/organization.admin.route.js';
import * as tagAdminRoutes from './tag/tag.admin.route.js';

const organizationalEntitiesRoutes = [certificationCenterAdminRoutes, organizationAdminRoutes, tagAdminRoutes];

export { organizationalEntitiesRoutes };
