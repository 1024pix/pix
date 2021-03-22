const { injectDefaults, injectDependencies } = require('../../infrastructure/utils/dependency-injection');
const EventDispatcher = require('../../infrastructure/events/EventDispatcher');
const _ = require('lodash');

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
  certificationCourseRepository: require('../../infrastructure/repositories/certification-course-repository'),
  competenceMarkRepository: require('../../infrastructure/repositories/competence-mark-repository'),
  competenceRepository: require('../../infrastructure/repositories/competence-repository'),
  knowledgeElementRepository: require('../../infrastructure/repositories/knowledge-element-repository'),
  organizationRepository: require('../../infrastructure/repositories/organization-repository'),
  poleEmploiSendingRepository: require('../../infrastructure/repositories/pole-emploi-sending-repository'),
  scoringCertificationService: require('../services/scoring/scoring-certification-service'),
  skillRepository: require('../../infrastructure/repositories/skill-repository'),
  targetProfileRepository: require('../../infrastructure/repositories/target-profile-repository'),
  targetProfileWithLearningContentRepository: require('../../infrastructure/repositories/target-profile-with-learning-content-repository'),
  userRepository: require('../../infrastructure/repositories/user-repository'),
  poleEmploiNotifier: require('../../infrastructure/externals/pole-emploi/pole-emploi-notifier'),
  juryCertificationSummaryRepository: require('../../infrastructure/repositories/jury-certification-summary-repository'),
  finalizedSessionRepository: require('../../infrastructure/repositories/finalized-session-repository'),
};

const partnerCertificationRepository = injectDependencies(
  require('../../infrastructure/repositories/partner-certification-repository'),
  dependencies,
);
dependencies.partnerCertificationRepository = partnerCertificationRepository;

const handlersToBeInjected = {
  handleBadgeAcquisition: require('./handle-badge-acquisition'),
  handleCertificationScoring: require('./handle-certification-scoring'),
  handlePartnerCertifications: require('./handle-partner-certification'),
  handlePoleEmploiParticipationFinished: require('./handle-pole-emploi-participation-finished'),
  handlePoleEmploiParticipationShared: require('./handle-pole-emploi-participation-shared'),
  handlePoleEmploiParticipationStarted: require('./handle-pole-emploi-participation-started'),
  computeValidatedSkillsCount: require('./compute-validated-skills-count'),
  handleSessionFinalized: require('./handle-session-finalized'),
  handleChallengeRequested: require('./handle-challenge-requested'),
};

function buildEventDispatcher(handlersStubs) {
  const eventDispatcher = new EventDispatcher();
  const handlers = { ...handlersToBeInjected, ...handlersStubs };

  for (const key in handlers) {
    const inject = _.partial(injectDefaults, dependencies);
    eventDispatcher.subscribe(handlersToBeInjected[key].eventType, inject(handlers[key]));
  }

  return eventDispatcher;
}

module.exports = {
  eventDispatcher: buildEventDispatcher({}),
  _forTestOnly: {
    handlers: handlersToBeInjected,
    buildEventDispatcher: function(stubbedHandlers) {
      return buildEventDispatcher(stubbedHandlers);
    },
  },
};
