import * as session from './application/session-route.js';
import * as sessionLiveAlert from './application/session-live-alert-route.js';
import * as attendanceSheet from './application/attendance-sheet-route.js';
import * as certificationCandidate from './application/certification-candidate-route.js';
import * as invigilatorKit from './application/invigilator-kit-route.js';
import * as updateCpfImportStatus from './application/update-cpf-import-status-route.js';
import * as sessionMassImport from './application/session-mass-import-route.js';
import * as certificationOfficer from './application/certification-officer-route.js';
import * as sessionUnfinalize from './application/session-unfinalize-route.js';

const certificationSessionRoutes = [
  session,
  sessionLiveAlert,
  attendanceSheet,
  certificationCandidate,
  invigilatorKit,
  updateCpfImportStatus,
  sessionMassImport,
  certificationOfficer,
  sessionUnfinalize,
];

export { certificationSessionRoutes };
