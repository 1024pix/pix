import * as competenceEvaluationsRoutes from './application/competence-evaluations/index.js';
import * as stagesRoutes from './application/stages/index.js';

const evaluationRoutes = [competenceEvaluationsRoutes, stagesRoutes];

export { evaluationRoutes };
