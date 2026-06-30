import { administrationTeamAdminRoute } from './administration-team/administration-team.admin.route.js';
import { certificationCenterAdminRoute } from './certification-center/certification-center.admin.route.js';
import { networkAdminRoute } from './network/network.admin.route.js';
import { organizationAdminRoute } from './organization/organization.admin.route.js';
import { organizationLearnerTypeAdminRoute } from './organization-learner-type/organization-learner-type.admin.route.js';
import { tagAdminRoute } from './tag/tag.admin.route.js';

const organizationalEntitiesRoutes = [
  certificationCenterAdminRoute,
  organizationAdminRoute,
  networkAdminRoute,
  administrationTeamAdminRoute,
  organizationLearnerTypeAdminRoute,
  tagAdminRoute,
];

export { organizationalEntitiesRoutes };
