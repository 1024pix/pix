import { attendanceSheetRoute } from './application/attendance-sheet-route.js';
import { certificationCandidateRoute } from './application/certification-candidate-route.js';
import { certificationCenterRoute } from './application/certification-center-route.js';
import { certificationCentersGetDivisionsRoute } from './application/certification-centers-get-divisions-route.js';
import { enrolmentRoute } from './application/enrolment-route.js';
import { sessionMassImportRoute } from './application/session-mass-import-route.js';
import { sessionRoute } from './application/session-route.js';
import { userRoute } from './application/user-route.js';

const certificationEnrolmentRoutes = [
  attendanceSheetRoute,
  certificationCandidateRoute,
  enrolmentRoute,
  sessionRoute,
  sessionMassImportRoute,
  certificationCenterRoute,
  certificationCentersGetDivisionsRoute,
  userRoute,
];

export { certificationEnrolmentRoutes };
