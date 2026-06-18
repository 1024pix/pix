import { answersRoute } from './application/answers/index.js';
import { assessmentsRoute } from './application/assessments/index.js.js';
import { autonomousCoursesRoute } from './application/autonomous-courses/index.js';
import { badgeCriteriaRoute } from './application/badge-criteria/index.js';
import { badgesRoute } from './application/badges/index.js';
import { challengesRoute } from './application/challenges/index.js';
import { competenceEvaluationsRoute } from './application/competence-evaluations/index.js';
import { courseRoute } from './application/courses/course-route.js';
import { feedbacksRoute } from './application/feedbacks/index.js';
import { progressionsRoute } from './application/progressions/index.js';
import { scorecardsRoute } from './application/scorecards/index.js';
import { smartRandomSimulatorRoute } from './application/smart-random-simulator/index.js';
import { usersRoute } from './application/users/index.js';

const evaluationRoutes = [
  assessmentsRoute,
  answersRoute,
  autonomousCoursesRoute,
  badgeCriteriaRoute,
  badgesRoute,
  challengesRoute,
  competenceEvaluationsRoute,
  courseRoute,
  feedbacksRoute,
  progressionsRoute,
  scorecardsRoute,
  smartRandomSimulatorRoute,
  usersRoute,
];

export { evaluationRoutes };
