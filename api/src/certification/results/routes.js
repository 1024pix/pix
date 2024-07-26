import * as certificationAttestation from './application/certification-attestation-route.js';
import * as certificationReports from './application/certification-reports-route.js';
import * as certificationResults from './application/certification-results-route.js';
import * as certification from './application/certification-route.js';
import * as livretScolaire from './application/livret-scolaire-route.js';
import * as organization from './application/organization-route.js';

const certificationResultRoutes = [
  certificationAttestation,
  certificationReports,
  certificationResults,
  certification,
  livretScolaire,
  organization,
];

export { certificationResultRoutes };
