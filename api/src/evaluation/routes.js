import * as competenceEvaluationsRoutes from './application/competence-evaluations/index.js';
import * as feedbacksRoutes from './application/feedbacks/index.js';
import * as stagesRoutes from './application/stages/index.js';

const evaluationRoutes = [competenceEvaluationsRoutes, feedbacksRoutes, stagesRoutes];

export { evaluationRoutes };
