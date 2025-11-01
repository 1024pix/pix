import * as assessmentsRoutes from './application/assessments/index.js';
import * as challengesRoutes from './application/challenges/index.js';
import * as contextRoutes from './application/context/context.route.js';
import * as featureToggles from './application/feature-toggles/index.js';
import * as healthcheck from './application/healthcheck/index.js';

const sharedRoutes = [healthcheck, assessmentsRoutes, challengesRoutes, contextRoutes, featureToggles];

export { sharedRoutes };
