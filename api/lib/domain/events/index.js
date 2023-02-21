import { injectDefaults, injectDependencies } from '../../infrastructure/utils/dependency-injection';
import EventDispatcher from '../../infrastructure/events/EventDispatcher';
import EventDispatcherLogger from '../../infrastructure/events/EventDispatcherLogger';
import MonitoringTools from '../../infrastructure/monitoring-tools';
import settings from '../../config';
import _ from 'lodash';
import { performance } from 'perf_hooks';
import eventBusBuilder from '../../infrastructure/events/EventBusBuilder';

import assessmentRepository from '../../infrastructure/repositories/assessment-repository';
import assessmentResultRepository from '../../infrastructure/repositories/assessment-result-repository';
import badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository';
import badgeRepository from '../../infrastructure/repositories/badge-repository';
import campaignRepository from '../../infrastructure/repositories/campaign-repository';
import campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository';
import campaignParticipationResultRepository from '../../infrastructure/repositories/campaign-participation-result-repository';
import certificationAssessmentRepository from '../../infrastructure/repositories/certification-assessment-repository';
import certificationCenterRepository from '../../infrastructure/repositories/certification-center-repository';
import certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository';
import certificationIssueReportRepository from '../../infrastructure/repositories/certification-issue-report-repository';
import competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository';
import competenceRepository from '../../infrastructure/repositories/competence-repository';
import complementaryCertificationCourseRepository from '../../infrastructure/repositories/complementary-certification-course-repository';
import complementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository';
import knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository';
import organizationRepository from '../../infrastructure/repositories/organization-repository';
import poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository';
import scoringCertificationService from '../services/scoring/scoring-certification-service';
import skillRepository from '../../infrastructure/repositories/skill-repository';
import supervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository';
import targetProfileRepository from '../../infrastructure/repositories/target-profile-repository';
import userRepository from '../../infrastructure/repositories/user-repository';
import participantResultsSharedRepository from '../../infrastructure/repositories/participant-results-shared-repository';
import poleEmploiNotifier from '../../infrastructure/externals/pole-emploi/pole-emploi-notifier';
import juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository';
import finalizedSessionRepository from '../../infrastructure/repositories/sessions/finalized-session-repository';
import challengeRepository from '../../infrastructure/repositories/challenge-repository';
import logger from '../../infrastructure/logger';

const dependencies = {
  assessmentRepository,
  assessmentResultRepository,
  badgeAcquisitionRepository,
  badgeRepository,
  campaignRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  certificationAssessmentRepository,
  certificationCenterRepository,
  certificationCourseRepository,
  certificationIssueReportRepository,
  competenceMarkRepository,
  competenceRepository,
  complementaryCertificationCourseRepository,
  complementaryCertificationScoringCriteriaRepository,
  knowledgeElementRepository,
  organizationRepository,
  poleEmploiSendingRepository,
  scoringCertificationService,
  skillRepository,
  supervisorAccessRepository,
  targetProfileRepository,
  userRepository,
  participantResultsSharedRepository,
  poleEmploiNotifier,
  juryCertificationSummaryRepository,
  finalizedSessionRepository,
  challengeRepository,
  logger,
};
import partnerCertificationScoringRepository from '../../infrastructure/repositories/partner-certification-scoring-repository';

dependencies.partnerCertificationScoringRepository = injectDependencies(
  partnerCertificationScoringRepository,
  dependencies
);
import handleAutoJury from './handle-auto-jury';
import handleCertificationScoring from './handle-certification-scoring';
import handleCertificationRescoring from './handle-certification-rescoring';
import handleComplementaryCertificationsScoring from './handle-complementary-certifications-scoring';
import handlePoleEmploiParticipationFinished from './handle-pole-emploi-participation-finished';
import handlePoleEmploiParticipationStarted from './handle-pole-emploi-participation-started';
import handleSessionFinalized from './handle-session-finalized';

const handlersToBeInjected = {
  handleAutoJury,
  handleCertificationScoring,
  handleCertificationRescoring,
  handleComplementaryCertificationsScoring,
  handlePoleEmploiParticipationFinished,
  handlePoleEmploiParticipationStarted,
  handleSessionFinalized,
};

function buildEventDispatcher(handlersStubs) {
  const eventDispatcher = new EventDispatcher(new EventDispatcherLogger(MonitoringTools, settings, performance));

  const handlersNames = _.map(handlersToBeInjected, (handler) => handler.name);

  if (_.some(handlersNames, (name) => _.isEmpty(name))) {
    throw new Error('All handlers must have a name. Handlers : ' + handlersNames.join(', '));
  }
  if (_.uniq(handlersNames).length !== handlersNames.length) {
    throw new Error('All handlers must have a unique name. Handlers : ' + handlersNames.join(', '));
  }

  const handlers = { ...handlersToBeInjected, ...handlersStubs };

  for (const key in handlers) {
    const inject = _.partial(injectDefaults, dependencies);
    const injectedHandler = inject(handlers[key]);
    injectedHandler.handlerName = handlers[key].name;
    for (const eventType of handlersToBeInjected[key].eventTypes) {
      eventDispatcher.subscribe(eventType, injectedHandler);
    }
  }
  return eventDispatcher;
}

export default {
  eventDispatcher: buildEventDispatcher({}),
  eventBus: eventBusBuilder.build(),
  _forTestOnly: {
    handlers: handlersToBeInjected,
    buildEventDispatcher: function (stubbedHandlers) {
      return buildEventDispatcher(stubbedHandlers);
    },
  },
};
