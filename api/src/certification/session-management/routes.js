import { cancellationRoute } from './application/cancellation-route.js';
import { certificationCandidateRoute } from './application/certification-candidate-route.js';
import { certificationCentersSessionSummariesRoute } from './application/certification-centers-session-summaries-route.js';
import { certificationCourseRoute } from './application/certification-course-route.js';
import { certificationDetailsRoute } from './application/certification-details-route.js';
import { certificationIssueReportRoute } from './application/certification-issue-report-route.js';
import { certificationOfficerRoute } from './application/certification-officer-route.js';
import { certificationReportRoute } from './application/certification-report-route.js';
import { companionAlertRoute } from './application/companion-alert-route.js';
import { complementaryCertificationCourseResultsRoute } from './application/complementary-certification-course-results-route.js';
import { finalizeRoute } from './application/finalize-route.js';
import { finalizedSessionRoute } from './application/finalized-session-route.js';
import { invigilatorKitRoute } from './application/invigilator-kit-route.js';
import { juryCertificationRoute } from './application/jury-certification-route.js';
import { juryCertificationSummariesRoute } from './application/jury-certification-summaries-route.js';
import { juryCommentRoute } from './application/jury-comment-route.js';
import { sessionForSupervisingRoute } from './application/session-for-supervising-route.js';
import { sessionLiveAlertRoute } from './application/session-live-alert-route.js';
import { sessionPublicationRoute } from './application/session-publication-route.js';
import { sessionRoute } from './application/session-route.js';
import { superviseRoute } from './application/supervise-route.js';
import { unfinalizeRoute } from './application/unfinalize-route.js';

const certificationSessionRoutes = [
  cancellationRoute,
  certificationCourseRoute,
  certificationOfficerRoute,
  certificationReportRoute,
  certificationIssueReportRoute,
  companionAlertRoute,
  complementaryCertificationCourseResultsRoute,
  finalizeRoute,
  finalizedSessionRoute,
  certificationCandidateRoute,
  certificationDetailsRoute,
  invigilatorKitRoute,
  juryCertificationRoute,
  juryCommentRoute,
  juryCertificationSummariesRoute,
  sessionRoute,
  certificationCentersSessionSummariesRoute,
  sessionForSupervisingRoute,
  sessionLiveAlertRoute,
  sessionPublicationRoute,
  superviseRoute,
  unfinalizeRoute,
];

export { certificationSessionRoutes };
