import { countryRoute } from './application/country/country-route.js';
import { featureTogglesRoute } from './application/feature-toggles/index.js';
import { healthcheckRoute } from './application/healthcheck/index.js';

const sharedRoutes = [healthcheckRoute, featureTogglesRoute, countryRoute];

export { sharedRoutes };
