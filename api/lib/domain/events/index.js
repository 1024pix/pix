import perf_hooks from 'node:perf_hooks';

import _ from 'lodash';

import * as complementaryCertificationBadgesRepository from '../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as flashAlgorithmService from '../../../src/certification/flash-certification/domain/services/algorithm-methods/flash.js';
import * as flashAlgorithmConfigurationRepository from '../../../src/certification/flash-certification/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as certificationAssessmentHistoryRepository from '../../../src/certification/scoring/infrastructure/repositories/certification-assessment-history-repository.js';
import * as certificationChallengeForScoringRepository from '../../../src/certification/scoring/infrastructure/repositories/certification-challenge-for-scoring-repository.js';
import * as scoringConfigurationRepository from '../../../src/certification/scoring/infrastructure/repositories/scoring-configuration-repository.js';
import * as finalizedSessionRepository from '../../../src/certification/session/infrastructure/repositories/finalized-session-repository.js';
import * as certificationAssessmentRepository from '../../../src/certification/shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCenterRepository from '../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationCourseRepository from '../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationIssueReportRepository from '../../../src/certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as answerRepository from '../../../src/shared/infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import * as authenticationMethodRepository from '../../../src/shared/infrastructure/repositories/authentication-method-repository.js';
import * as challengeRepository from '../../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as organizationRepository from '../../../src/shared/infrastructure/repositories/organization-repository.js';
import * as userRepository from '../../../src/shared/infrastructure/repositories/user-repository.js';
import { injectDefaults } from '../../../src/shared/infrastructure/utils/dependency-injection.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
import { config } from '../../config.js';
import * as eventBusBuilder from '../../infrastructure/events/EventBusBuilder.js';
import { EventDispatcher } from '../../infrastructure/events/EventDispatcher.js';
import { EventDispatcherLogger } from '../../infrastructure/events/EventDispatcherLogger.js';
import * as disabledPoleEmploiNotifier from '../../infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js';
import * as poleEmploiNotifier from '../../infrastructure/externals/pole-emploi/pole-emploi-notifier.js';
import { monitoringTools as MonitoringTools } from '../../infrastructure/monitoring-tools.js';
import * as badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as campaignParticipationResultRepository from '../../infrastructure/repositories/campaign-participation-result-repository.js';
import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import * as juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import * as knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository.js';
import { participantResultsSharedRepository } from '../../infrastructure/repositories/participant-results-shared-repository.js';
import * as poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import * as skillRepository from '../../infrastructure/repositories/skill-repository.js';
import * as supervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository.js';
import * as targetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
import * as scoringCertificationService from '../services/scoring/scoring-certification-service.js';
import { handleAutoJury } from './handle-auto-jury.js';
import { handleCertificationRescoring } from './handle-certification-rescoring.js';
import { handleCertificationScoring } from './handle-certification-scoring.js';
import { handleComplementaryCertificationsScoring } from './handle-complementary-certifications-scoring.js';
import { handlePoleEmploiParticipationFinished } from './handle-pole-emploi-participation-finished.js';
import { handlePoleEmploiParticipationStarted } from './handle-pole-emploi-participation-started.js';
import { handleSessionFinalized } from './handle-session-finalized.js';
const { performance } = perf_hooks;

function requirePoleEmploiNotifier() {
  if (config.poleEmploi.pushEnabled) {
    return poleEmploiNotifier;
  } else {
    return disabledPoleEmploiNotifier;
  }
}

const dependencies = {
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  authenticationMethodRepository,
  badgeAcquisitionRepository,
  campaignRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  certificationAssessmentHistoryRepository,
  certificationAssessmentRepository,
  certificationCenterRepository,
  certificationChallengeForScoringRepository,
  certificationCourseRepository,
  certificationIssueReportRepository,
  challengeRepository,
  competenceMarkRepository,
  competenceRepository,
  complementaryCertificationBadgesRepository,
  complementaryCertificationCourseResultRepository,
  complementaryCertificationScoringCriteriaRepository,
  finalizedSessionRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  juryCertificationSummaryRepository,
  knowledgeElementRepository,
  logger,
  organizationRepository,
  participantResultsSharedRepository,
  poleEmploiNotifier: requirePoleEmploiNotifier(),
  poleEmploiSendingRepository,
  scoringCertificationService,
  skillRepository,
  scoringConfigurationRepository,
  supervisorAccessRepository,
  targetProfileRepository,
  userRepository,
};

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
  const eventDispatcher = new EventDispatcher(new EventDispatcherLogger(MonitoringTools, config, performance));

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

export { _forTestOnly, eventBus, eventDispatcher };
