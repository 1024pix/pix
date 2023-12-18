import * as assessmentsRoutes from './application/assessments/index.js';
import * as badgesRoutes from './application/badges/index.js';

const sharedRoutes = [assessmentsRoutes, badgesRoutes];

export { sharedRoutes };
