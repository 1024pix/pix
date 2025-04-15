import * as learnerActivityRoute from './application/learner-activity-route.js';
import * as learnerListRoute from './application/learner-list-route.js';
import * as organizationLearnersRoute from './application/organization-learners-route.js';
import * as registrationOrganizationLearnerRoutes from './application/registration-organization-learner-route.js';
import * as scoLearnerListRoute from './application/sco-learner-list-route.js';
import * as scoOrganizationLearnersRoute from './application/sco-organization-learner-route.js';
import * as supLearnerListRoute from './application/sup-learner-list-route.js';

const organizationLearnerRoutes = [
  scoLearnerListRoute,
  learnerListRoute,
  learnerActivityRoute,
  registrationOrganizationLearnerRoutes,
  supLearnerListRoute,
  organizationLearnersRoute,
  scoOrganizationLearnersRoute,
];

export { organizationLearnerRoutes };
