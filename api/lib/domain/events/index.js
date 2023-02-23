const { injectDefaults, injectDependencies } = require('../../infrastructure/utils/dependency-injection');
const EventDispatcher = require('../../infrastructure/events/EventDispatcher');
const EventDispatcherLogger = require('../../infrastructure/events/EventDispatcherLogger');
const MonitoringTools = require('../../infrastructure/monitoring-tools');
const settings = require('../../config');
const _ = require('lodash');
const { performance } = require('perf_hooks');
const eventBusBuilder = require('../../infrastructure/events/EventBusBuilder');

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const campaignParticipationResultRepository = require('../../infrastructure/repositories/campaign-participation-result-repository');
const certificationAssessmentRepository = require('../../infrastructure/repositories/certification-assessment-repository');
const certificationCenterRepository = require('../../infrastructure/repositories/certification-center-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const certificationIssueReportRepository = require('../../infrastructure/repositories/certification-issue-report-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const complementaryCertificationCourseRepository = require('../../infrastructure/repositories/complementary-certification-course-repository');
const complementaryCertificationScoringCriteriaRepository = require('../../infrastructure/repositories/complementary-certification-scoring-criteria-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const poleEmploiSendingRepository = require('../../infrastructure/repositories/pole-emploi-sending-repository');
const scoringCertificationService = require('../services/scoring/scoring-certification-service');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const supervisorAccessRepository = require('../../infrastructure/repositories/supervisor-access-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');
const participantResultsSharedRepository = require('../../infrastructure/repositories/participant-results-shared-repository');
const poleEmploiNotifier = require('../../infrastructure/externals/pole-emploi/pole-emploi-notifier');
const juryCertificationSummaryRepository = require('../../infrastructure/repositories/jury-certification-summary-repository');
const finalizedSessionRepository = require('../../infrastructure/repositories/sessions/finalized-session-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const logger = require('../../infrastructure/logger');

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

const dependency = require('../../infrastructure/repositories/partner-certification-scoring-repository');
const partnerCertificationScoringRepository = injectDependencies(dependency, dependencies);
dependencies.partnerCertificationScoringRepository = partnerCertificationScoringRepository;

const handleAutoJury = require('./handle-auto-jury');
const handleCertificationScoring = require('./handle-certification-scoring');
const handleCertificationRescoring = require('./handle-certification-rescoring');
const handleComplementaryCertificationsScoring = require('./handle-complementary-certifications-scoring');
const handlePoleEmploiParticipationFinished = require('./handle-pole-emploi-participation-finished');
const handlePoleEmploiParticipationStarted = require('./handle-pole-emploi-participation-started');
const handleSessionFinalized = require('./handle-session-finalized');

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
