import * as autonomousCoursesRoutes from './application/autonomous-courses/index.js';
import * as competenceEvaluationsRoutes from './application/competence-evaluations/index.js';
import * as feedbacksRoutes from './application/feedbacks/index.js';
import * as scorecardsRoutes from './application/scorecards/index.js';
import * as stagesRoutes from './application/stages/index.js';
import * as stageCollectionRoutes from './application/stage-collections/index.js';

const evaluationRoutes = [
  autonomousCoursesRoutes,
  competenceEvaluationsRoutes,
  stageCollectionRoutes,
  feedbacksRoutes,
  scorecardsRoutes,
  stagesRoutes,
];

export { evaluationRoutes };
