import * as assessmentsRoutes from './application/assessments/index.js';
import * as assessmentResultsRoutes from './application/assessment-results/index.js';

const sharedRoutes = [assessmentsRoutes, assessmentResultsRoutes];

export { sharedRoutes };
