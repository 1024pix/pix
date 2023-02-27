const { injectDefaults, injectDependencies } = require('../../infrastructure/utils/dependency-injection.js');
const EventDispatcher = require('../../infrastructure/events/EventDispatcher.js');
const EventDispatcherLogger = require('../../infrastructure/events/EventDispatcherLogger.js');
const MonitoringTools = require('../../infrastructure/monitoring-tools.js');
const settings = require('../../config.js');
const _ = require('lodash');
const { performance } = require('perf_hooks');
const eventBusBuilder = require('../../infrastructure/events/EventBusBuilder.js');

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository.js');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository.js');
const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository.js');
const badgeRepository = require('../../infrastructure/repositories/badge-repository.js');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository.js');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository.js');
const campaignParticipationResultRepository = require('../../infrastructure/repositories/campaign-participation-result-repository.js');
const certificationAssessmentRepository = require('../../infrastructure/repositories/certification-assessment-repository.js');
const certificationCenterRepository = require('../../infrastructure/repositories/certification-center-repository.js');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository.js');
const certificationIssueReportRepository = require('../../infrastructure/repositories/certification-issue-report-repository.js');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository.js');
const competenceRepository = require('../../infrastructure/repositories/competence-repository.js');
const complementaryCertificationCourseRepository = require('../../infrastructure/repositories/complementary-certification-course-repository.js');
const complementaryCertificationScoringCriteriaRepository = require('../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository.js');
const organizationRepository = require('../../infrastructure/repositories/organization-repository.js');
const poleEmploiSendingRepository = require('../../infrastructure/repositories/pole-emploi-sending-repository.js');
const scoringCertificationService = require('../services/scoring/scoring-certification-service.js');
const skillRepository = require('../../infrastructure/repositories/skill-repository.js');
const supervisorAccessRepository = require('../../infrastructure/repositories/supervisor-access-repository.js');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository.js');
const userRepository = require('../../infrastructure/repositories/user-repository.js');
const participantResultsSharedRepository = require('../../infrastructure/repositories/participant-results-shared-repository.js');
const juryCertificationSummaryRepository = require('../../infrastructure/repositories/jury-certification-summary-repository.js');
const finalizedSessionRepository = require('../../infrastructure/repositories/sessions/finalized-session-repository.js');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository.js');
const logger = require('../../infrastructure/logger.js');
const poleEmploiNotifier = require('../../infrastructure/externals/pole-emploi/pole-emploi-notifier.js');
const disabledPoleEmploiNotifier = require('../../infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js');

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

const dependency = require('../../infrastructure/repositories/partner-certification-scoring-repository.js');
const partnerCertificationScoringRepository = injectDependencies(dependency, dependencies);
dependencies.partnerCertificationScoringRepository = partnerCertificationScoringRepository;

const handleAutoJury = require('./handle-auto-jury.js');
const handleCertificationScoring = require('./handle-certification-scoring.js');
const handleCertificationRescoring = require('./handle-certification-rescoring.js');
const handleComplementaryCertificationsScoring = require('./handle-complementary-certifications-scoring.js');
const handlePoleEmploiParticipationFinished = require('./handle-pole-emploi-participation-finished.js');
const handlePoleEmploiParticipationStarted = require('./handle-pole-emploi-participation-started.js');
const handleSessionFinalized = require('./handle-session-finalized.js');

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

module.exports = {
  eventDispatcher,
  eventBus,
  _forTestOnly,
};
