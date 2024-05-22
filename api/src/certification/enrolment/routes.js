import * as attendanceSheet from '../enrolment/application/attendance-sheet-route.js';
import * as certificationCandidate from '../enrolment/application/certification-candidate-route.js';
import * as sessionMassImport from './application/session-mass-import-route.js';
import * as session from './application/session-route.js';

const certificationEnrolmentRoutes = [session, sessionMassImport, attendanceSheet, certificationCandidate];

export { certificationEnrolmentRoutes };
