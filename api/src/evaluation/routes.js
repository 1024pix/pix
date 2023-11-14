import * as competenceEvaluationsRoutes from './application/competence-evaluations/index.js';
import * as feedbacksRoutes from './application/feedbacks/index.js';
import * as stagesRoutes from './application/stages/index.js';
import * as stageCollectionRoutes from './application/stage-collections/index.js';

const evaluationRoutes = [competenceEvaluationsRoutes, stageCollectionRoutes, feedbacksRoutes, stagesRoutes];

export { evaluationRoutes };
