import * as supLearnerListRoute from './application/sup-learner-list-route.js';
import * as scoLearnerListRoute from './application/sco-learner-list-route.js';
import * as learnerListRoute from './application/learner-list-route.js';
import * as leanerActivityRoute from './application/learner-activity-route.js';

const organizationLearnerRoutes = [supLearnerListRoute, scoLearnerListRoute, learnerListRoute, leanerActivityRoute];

export { organizationLearnerRoutes };
