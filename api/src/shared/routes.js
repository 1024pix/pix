import * as assessmentsRoutes from './application/assessments/index.js';
import * as challengesRoutes from './application/challenges/index.js';

const sharedRoutes = [assessmentsRoutes, challengesRoutes];

export { sharedRoutes };
