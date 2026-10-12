import { countryRoute } from './application/country/country-route.js';
import { experimentRoute } from './application/experiment/experiment-routes.js';
import { featureTogglesRoute } from './application/feature-toggles/index.js';
import { healthcheckRoute } from './application/healthcheck/index.js';

const sharedRoutes = [healthcheckRoute, featureTogglesRoute, countryRoute, experimentRoute];

export { sharedRoutes };
