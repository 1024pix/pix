import * as certificationOfficer from './application/certification-officer-route.js';
import * as certificationReport from './application/certification-report-route.js';
import * as finalize from './application/finalize-route.js';
import * as invigilatorKit from './application/invigilator-kit-route.js';
import * as sessionLiveAlert from './application/session-live-alert-route.js';
import * as session from './application/session-route.js';
import * as unfinalize from './application/unfinalize-route.js';
import * as updateCpfImportStatus from './application/update-cpf-import-status-route.js';

const certificationSessionRoutes = [
  session,
  finalize,
  sessionLiveAlert,
  certificationReport,
  invigilatorKit,
  updateCpfImportStatus,
  certificationOfficer,
  unfinalize,
];

export { certificationSessionRoutes };
