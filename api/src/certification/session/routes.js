import * as session from './application/session-route.js';
import * as sessionLiveAlert from './application/session-live-alert-route.js';
import * as attendanceSheet from './application/attendance-sheet-route.js';
import * as certificationCandidate from './application/certification-candidate-route.js';
import * as invigilatorKit from './application/invigilator-kit-route.js';
import * as updateCpfImportStatus from './application/update-cpf-import-status-route.js';

const certificationSessionRoutes = [
  session,
  sessionLiveAlert,
  attendanceSheet,
  certificationCandidate,
  invigilatorKit,
  updateCpfImportStatus,
];

export { certificationSessionRoutes };
