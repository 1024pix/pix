import * as answersRoutes from './application/answers/index.js';
import * as assessmentRoutes from './application/assessments/index.js.js';
import * as autonomousCoursesRoutes from './application/autonomous-courses/index.js';
import * as badgeCriteriaRoutes from './application/badge-criteria/index.js';
import * as badgesRoutes from './application/badges/index.js';
import * as challengesRoutes from './application/challenges/index.js';
import * as competenceEvaluationsRoutes from './application/competence-evaluations/index.js';
import { courseRoute } from './application/courses/course-route.js';
import * as feedbacksRoutes from './application/feedbacks/index.js';
import * as progressionsRoutes from './application/progressions/index.js';
import * as scorecardsRoutes from './application/scorecards/index.js';
import * as smartRandomSimulatorRoutes from './application/smart-random-simulator/index.js';
import * as usersRoutes from './application/users/index.js';

const evaluationRoutes = [
  assessmentRoutes,
  answersRoutes,
  autonomousCoursesRoutes,
  badgeCriteriaRoutes,
  badgesRoutes,
  challengesRoutes,
  competenceEvaluationsRoutes,
  courseRoute,
  feedbacksRoutes,
  progressionsRoutes,
  scorecardsRoutes,
  smartRandomSimulatorRoutes,
  usersRoutes,
];

export { evaluationRoutes };
