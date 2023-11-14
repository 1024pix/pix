import * as createSession from './application/create-session-route.js';
import * as sessionLiveAlert from './application/session-live-alert-route.js';
import * as attendanceSheet from './application/attendance-sheet-route.js';
import * as certificationCandidate from './application/certification-candidate-route.js';
import * as invigilatorKit from './application/invigilator-kit-route.js';

const certificationSessionRoutes = [
  createSession,
  sessionLiveAlert,
  attendanceSheet,
  certificationCandidate,
  invigilatorKit,
];

export { certificationSessionRoutes };
