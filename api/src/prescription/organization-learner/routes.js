import * as learnerActivityRoute from './application/learner-activity-route.js';
import * as learnerListRoute from './application/learner-list-route.js';
import * as registrationOrganizationLearnerRoutes from './application/registration-organization-learner-route.js';
import * as scoLearnerListRoute from './application/sco-learner-list-route.js';
import * as supLearnerListRoute from './application/sup-learner-list-route.js';

const organizationLearnerRoutes = [
  scoLearnerListRoute,
  learnerListRoute,
  learnerActivityRoute,
  registrationOrganizationLearnerRoutes,
  supLearnerListRoute,
];

export { organizationLearnerRoutes };
