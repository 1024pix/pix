import * as activityAnswer from './application/activity-answer-route.js';
import * as assessment from './application/assessment-route.js';
import * as missionLearner from './application/mission-learner-route.js';
import * as mission from './application/mission-route.js';
import * as organizationLearner from './application/organization-learner-route.js';
import * as school from './application/school-route.js';

const schoolRoutes = [activityAnswer, assessment, mission, school, organizationLearner, missionLearner];

export { schoolRoutes };
