import { scenarioSimulatorRoute } from '../evaluation/application/scenario-simulator-route.js';
import { certificationAdminRoute } from './application/certification-admin-route.js';
import { certificationCourseRoute } from './application/certification-course-route.js';
import { certificationRescoringRoute } from './application/certification-rescoring-route.js';
import { companionAlertRoute } from './application/companion-alert-route.js';
import { liveAlertRoute } from './application/live-alert-route.js';
import { scoringAndCapacitySimulatorRoute } from './application/scoring-and-capacity-simulator-route.js';

const certificationEvaluationRoutes = [
  companionAlertRoute,
  liveAlertRoute,
  certificationCourseRoute,
  certificationAdminRoute,
  certificationRescoringRoute,
  scenarioSimulatorRoute,
  scoringAndCapacitySimulatorRoute,
];

export { certificationEvaluationRoutes };
