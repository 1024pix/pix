import * as assessment from './application/assessments/assessment-route.js';
import * as organizationLearner from './application/organization-learner/index.js';
import * as school from './application/school/index.js';
const schoolRoutes = [assessment, school, organizationLearner];

export { schoolRoutes };
