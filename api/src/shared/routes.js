import { assessmentsRoute } from './application/assessments/index.js';
import { countryRoute } from './application/country/country-route.js';
import { featureTogglesRoute } from './application/feature-toggles/index.js';
import { healthcheckRoute } from './application/healthcheck/index.js';

const sharedRoutes = [healthcheckRoute, assessmentsRoute, featureTogglesRoute, countryRoute];

export { sharedRoutes };
