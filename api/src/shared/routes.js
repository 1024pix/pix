import * as assessmentsRoutes from './application/assessments/index.js';
import * as challengesRoutes from './application/challenges/index.js';
import * as configRoutes from './application/config/config.route.js';
import * as countryRoutes from './application/country/country-route.js';
import * as featureToggles from './application/feature-toggles/index.js';
import * as healthcheck from './application/healthcheck/index.js';

const sharedRoutes = [healthcheck, assessmentsRoutes, challengesRoutes, configRoutes, featureToggles, countryRoutes];

export { sharedRoutes };
