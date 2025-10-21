import * as assessmentsRoutes from './application/assessments/index.js';
import * as challengesRoutes from './application/challenges/index.js';
import * as featureToggles from './application/feature-toggles/index.js';
import * as healthcheck from './application/healthcheck/index.js';
import * as seedsRoutes from './application/seeds/index.js';

const sharedRoutes = [healthcheck, assessmentsRoutes, challengesRoutes, featureToggles, seedsRoutes];

export { sharedRoutes };
