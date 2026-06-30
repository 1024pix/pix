import { learnerActivityRoute } from './application/learner-activity-route.js';
import { learnerListRoute } from './application/learner-list-route.js';
import { organizationLearnersRoute } from './application/organization-learners-route.js';
import { organizationToJoinRoute } from './application/organization-to-join-route.js';
import { registrationOrganizationLearnerRoute } from './application/registration-organization-learner-route.js';
import { scoLearnerListRoute } from './application/sco-learner-list-route.js';
import { scoOrganizationLearnerRoute } from './application/sco-organization-learner-route.js';
import { supLearnerListRoute } from './application/sup-learner-list-route.js';

const organizationLearnerRoutes = [
  scoLearnerListRoute,
  learnerListRoute,
  learnerActivityRoute,
  registrationOrganizationLearnerRoute,
  supLearnerListRoute,
  organizationLearnersRoute,
  organizationToJoinRoute,
  scoOrganizationLearnerRoute,
];

export { organizationLearnerRoutes };
