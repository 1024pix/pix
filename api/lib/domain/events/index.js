import { injectDefaults, injectDependencies } from '../../infrastructure/utils/dependency-injection.js';
import { EventDispatcher } from '../../infrastructure/events/EventDispatcher.js';
import { EventDispatcherLogger } from '../../infrastructure/events/EventDispatcherLogger.js';
import { MonitoringTools } from '../../infrastructure/monitoring-tools.js';
import { settings } from '../../config.js';
import _ from 'lodash';
import { performance } from 'perf_hooks';
import { eventBusBuilder } from '../../infrastructure/events/EventBusBuilder.js';

import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../infrastructure/repositories/assessment-result-repository.js';
import * as badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as campaignParticipationResultRepository from '../../infrastructure/repositories/campaign-participation-result-repository.js';
import * as certificationAssessmentRepository from '../../infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCenterRepository from '../../infrastructure/repositories/certification-center-repository.js';
import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
import * as certificationIssueReportRepository from '../../infrastructure/repositories/certification-issue-report-repository.js';
import * as competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository.js';
import * as competenceRepository from '../../infrastructure/repositories/competence-repository.js';
import * as complementaryCertificationCourseRepository from '../../infrastructure/repositories/complementary-certification-course-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import * as knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository.js';
import * as organizationRepository from '../../infrastructure/repositories/organization-repository.js';
import * as poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import * as scoringCertificationService from '../services/scoring/scoring-certification-service.js';
import * as skillRepository from '../../infrastructure/repositories/skill-repository.js';
import * as supervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository.js';
import * as targetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
import * as userRepository from '../../infrastructure/repositories/user-repository.js';
import * as participantResultsSharedRepository from '../../infrastructure/repositories/participant-results-shared-repository.js';
import * as juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import * as finalizedSessionRepository from '../../infrastructure/repositories/sessions/finalized-session-repository.js';
import * as challengeRepository from '../../infrastructure/repositories/challenge-repository.js';
import { logger } from '../../infrastructure/logger.js';
import { poleEmploiNotifier } from '../../infrastructure/externals/pole-emploi/pole-emploi-notifier.js';
import { disabledPoleEmploiNotifier } from '../../infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js';

function requirePoleEmploiNotifier() {
  if (settings.poleEmploi.pushEnabled) {
    return poleEmploiNotifier;
  } else {
    return disabledPoleEmploiNotifier;
  }
}

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
  poleEmploiNotifier: requirePoleEmploiNotifier(),
  juryCertificationSummaryRepository,
  finalizedSessionRepository,
  challengeRepository,
  logger,
};

import * as dependency from '../../infrastructure/repositories/partner-certification-scoring-repository.js';
const partnerCertificationScoringRepository = injectDependencies(dependency, dependencies);
dependencies.partnerCertificationScoringRepository = partnerCertificationScoringRepository;

import { handleAutoJury } from './handle-auto-jury.js';
import { handleCertificationScoring } from './handle-certification-scoring.js';
import { handleCertificationRescoring } from './handle-certification-rescoring.js';
import { handleComplementaryCertificationsScoring } from './handle-complementary-certifications-scoring.js';
import { handlePoleEmploiParticipationFinished } from './handle-pole-emploi-participation-finished.js';
import { handlePoleEmploiParticipationStarted } from './handle-pole-emploi-participation-started.js';
import { handleSessionFinalized } from './handle-session-finalized.js';

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

const eventDispatcher = buildEventDispatcher({});
const eventBus = eventBusBuilder.build();
const _forTestOnly = {
  handlers: handlersToBeInjected,
  buildEventDispatcher: function (stubbedHandlers) {
    return buildEventDispatcher(stubbedHandlers);
  },
};

export { eventDispatcher, eventBus, _forTestOnly };
