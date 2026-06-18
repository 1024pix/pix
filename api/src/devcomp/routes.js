import { campaignParticipationRoute } from './application/campaign-participations/campaign-participation-route.js';
import { moduleIssueReportRoute } from './application/module-issue-report/module-issue-report-route.js';
import { moduleRoute } from './application/modules/module-route.js';
import { moduleMetadataRoute } from './application/modules-metadata/module-metadata-route.js';
import { passageEventRoute } from './application/passage-events/passage-event-route.js';
import { passageRoute } from './application/passages/passage-route.js';
import { trainingRoute } from './application/trainings/training-route.js';
import { tutorialEvaluationsRoute } from './application/tutorial-evaluations/tutorial-evaluations-route.js';
import { userTrainingsRoute } from './application/user-trainings/user-trainings-route.js';
import { userTutorialsRoute } from './application/user-tutorials/user-tutorials-route.js';

const devcompRoutes = [
  campaignParticipationRoute,
  moduleIssueReportRoute,
  moduleRoute,
  moduleMetadataRoute,
  passageRoute,
  passageEventRoute,
  trainingRoute,
  userTutorialsRoute,
  tutorialEvaluationsRoute,
  userTrainingsRoute,
];

export { devcompRoutes };
