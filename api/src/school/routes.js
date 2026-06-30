import { activityAnswerRoute } from './application/activity-answer-route.js';
import { assessmentRoute } from './application/assessment-route.js';
import { challengeRoute } from './application/challenge-route.js';
import { missionLearnerRoute } from './application/mission-learner-route.js';
import { missionRoute } from './application/mission-route.js';
import { organizationLearnerRoute } from './application/organization-learner-route.js';
import { schoolRoute } from './application/school-route.js';

const schoolRoutes = [
  activityAnswerRoute,
  assessmentRoute,
  missionRoute,
  schoolRoute,
  organizationLearnerRoute,
  missionLearnerRoute,
  challengeRoute,
];

export { schoolRoutes };
