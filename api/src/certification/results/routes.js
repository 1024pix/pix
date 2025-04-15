import * as certificate from './application/certificate-route.js';
import * as certificationReports from './application/certification-reports-route.js';
import * as certificationResults from './application/certification-results-route.js';
import * as livretScolaire from './application/livret-scolaire-route.js';
import * as organization from './application/organization-route.js';

const certificationResultRoutes = [
  certificationReports,
  certificationResults,
  certificate,
  livretScolaire,
  organization,
];

export { certificationResultRoutes };
