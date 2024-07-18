import * as certificationOfficer from './application/certification-officer-route.js';
import * as certificationReport from './application/certification-report-route.js';
import * as finalize from './application/finalize-route.js';
import * as finalizedSession from './application/finalized-session-route.js';
import * as invigilatorKit from './application/invigilator-kit-route.js';
import * as juryComment from './application/jury-comment-route.js';
import * as sessionForSupervising from './application/session-for-supervising-route.js';
import * as sessionLiveAlert from './application/session-live-alert-route.js';
import * as session from './application/session-route.js';
import * as supervise from './application/supervise-route.js';
import * as unfinalize from './application/unfinalize-route.js';
import * as updateCpfImportStatus from './application/update-cpf-import-status-route.js';

const certificationSessionRoutes = [
  session,
  finalize,
  finalizedSession,
  sessionLiveAlert,
  certificationReport,
  invigilatorKit,
  updateCpfImportStatus,
  certificationOfficer,
  sessionForSupervising,
  supervise,
  unfinalize,
  juryComment,
];

export { certificationSessionRoutes };
