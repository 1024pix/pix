import { countryRoute } from './application/country/country-route.js';
import { featureTogglesRoute } from './application/feature-toggles/index.js';
import { healthcheckRoute } from './application/healthcheck/index.js';
import { knowledgeStateSimulationRoute } from './application/knowledge-states/knowledge-state-simulation-route.js';

const sharedRoutes = [healthcheckRoute, featureTogglesRoute, countryRoute, knowledgeStateSimulationRoute];

export { sharedRoutes };
