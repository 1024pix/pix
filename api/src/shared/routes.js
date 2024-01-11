import * as assessmentsRoutes from './application/assessments/index.js';
import * as badgesRoutes from './application/badges/index.js';
import * as challengesRoutes from './application/challenges/index.js';

const sharedRoutes = [assessmentsRoutes, badgesRoutes, challengesRoutes];

export { sharedRoutes };
