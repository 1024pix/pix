import * as assessmentsRoutes from './application/assessments/index.js';
import { countryRoute } from './application/country/country-route.js';
import * as featureToggles from './application/feature-toggles/index.js';
import * as healthcheck from './application/healthcheck/index.js';

const sharedRoutes = [healthcheck, assessmentsRoutes, featureToggles, countryRoute];

export { sharedRoutes };
