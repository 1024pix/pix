import { certificateRoute } from './application/certificate-route.js';
import { certificationReportsRoute } from './application/certification-reports-route.js';
import { certificationResultsRoute } from './application/certification-results-route.js';
import { livretScolaireRoute } from './application/livret-scolaire-route.js';
import { organizationRoute } from './application/organization-route.js';
import { userRoute } from './application/user-route.js';

const certificationResultRoutes = [
  certificationReportsRoute,
  certificationResultsRoute,
  certificateRoute,
  livretScolaireRoute,
  organizationRoute,
  userRoute,
];

export { certificationResultRoutes };
