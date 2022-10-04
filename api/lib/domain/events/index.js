const { injectDefaults, injectDependencies } = require('../../infrastructure/utils/dependency-injection');
const EventDispatcher = require('../../infrastructure/events/EventDispatcher');
const EventDispatcherLogger = require('../../infrastructure/events/EventDispatcherLogger');
const MonitoringTools = require('../../infrastructure/monitoring-tools');
const settings = require('../../config');
const _ = require('lodash');
const { performance } = require('perf_hooks');
const eventBusBuilder = require('../../infrastructure/events/EventBusBuilder');

const dependencies = {
  assessmentRepository: require('../../infrastructure/repositories/assessment-repository'),
  assessmentResultRepository: require('../../infrastructure/repositories/assessment-result-repository'),
  badgeAcquisitionRepository: require('../../infrastructure/repositories/badge-acquisition-repository'),
  badgeCriteriaService: require('../services/badge-criteria-service'),
  badgeRepository: require('../../infrastructure/repositories/badge-repository'),
  campaignRepository: require('../../infrastructure/repositories/campaign-repository'),
  campaignParticipationRepository: require('../../infrastructure/repositories/campaign-participation-repository'),
  campaignParticipationResultRepository: require('../../infrastructure/repositories/campaign-participation-result-repository'),
  certificationAssessmentRepository: require('../../infrastructure/repositories/certification-assessment-repository'),
  certificationCenterRepository: require('../../infrastructure/repositories/certification-center-repository'),
  certificationCourseRepository: require('../../infrastructure/repositories/certification-course-repository'),
  certificationIssueReportRepository: require('../../infrastructure/repositories/certification-issue-report-repository'),
  competenceMarkRepository: require('../../infrastructure/repositories/competence-mark-repository'),
  competenceRepository: require('../../infrastructure/repositories/competence-repository'),
  complementaryCertificationCourseRepository: require('../../infrastructure/repositories/complementary-certification-course-repository'),
  complementaryCertificationScoringCriteriaRepository: require('../../infrastructure/repositories/complementary-certification-scoring-criteria-repository'),
  knowledgeElementRepository: require('../../infrastructure/repositories/knowledge-element-repository'),
  endTestScreenRemovalService: require('../services/end-test-screen-removal-service'),
  organizationRepository: require('../../infrastructure/repositories/organization-repository'),
  poleEmploiSendingRepository: require('../../infrastructure/repositories/pole-emploi-sending-repository'),
  scoringCertificationService: require('../services/scoring/scoring-certification-service'),
  skillRepository: require('../../infrastructure/repositories/skill-repository'),
  supervisorAccessRepository: require('../../infrastructure/repositories/supervisor-access-repository'),
  targetProfileRepository: require('../../infrastructure/repositories/target-profile-repository'),
  userRepository: require('../../infrastructure/repositories/user-repository'),
  participantResultsSharedRepository: require('../../infrastructure/repositories/participant-results-shared-repository'),
  poleEmploiNotifier: require('../../infrastructure/externals/pole-emploi/pole-emploi-notifier'),
  juryCertificationSummaryRepository: require('../../infrastructure/repositories/jury-certification-summary-repository'),
  finalizedSessionRepository: require('../../infrastructure/repositories/sessions/finalized-session-repository'),
  challengeRepository: require('../../infrastructure/repositories/challenge-repository'),
  logger: require('../../infrastructure/logger'),
};

const partnerCertificationScoringRepository = injectDependencies(
  require('../../infrastructure/repositories/partner-certification-scoring-repository'),
  dependencies
);
dependencies.partnerCertificationScoringRepository = partnerCertificationScoringRepository;

const handlersToBeInjected = {
  handleAutoJury: require('./handle-auto-jury'),
  handleCertificationScoring: require('./handle-certification-scoring'),
  handleCertificationRescoring: require('./handle-certification-rescoring'),
  handleComplementaryCertificationsScoring: require('./handle-complementary-certifications-scoring'),
  handlePoleEmploiParticipationFinished: require('./handle-pole-emploi-participation-finished'),
  handlePoleEmploiParticipationStarted: require('./handle-pole-emploi-participation-started'),
  handleSessionFinalized: require('./handle-session-finalized'),
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

module.exports = {
  eventDispatcher: buildEventDispatcher({}),
  eventBus: eventBusBuilder.build(),
  _forTestOnly: {
    handlers: handlersToBeInjected,
    buildEventDispatcher: function (stubbedHandlers) {
      return buildEventDispatcher(stubbedHandlers);
    },
  },
};
