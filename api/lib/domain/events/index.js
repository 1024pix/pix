const { injectDefaults, injectDependencies } = require('../../infrastructure/utils/dependency-injection');
const EventDispatcher = require('../../infrastructure/events/EventDispatcher');
const _ = require('lodash');

const dependencies = {
  assessmentResultRepository: require('../../infrastructure/repositories/assessment-result-repository'),
  certificationAssessmentRepository: require('../../infrastructure/repositories/certification-assessment-repository'),
  badgeAcquisitionRepository: require('../../infrastructure/repositories/badge-acquisition-repository'),
  badgeCriteriaService: require('../services/badge-criteria-service'),
  badgeRepository: require('../../infrastructure/repositories/badge-repository'),
  campaignParticipationResultRepository: require('../../infrastructure/repositories/campaign-participation-result-repository'),
  certificationCourseRepository: require('../../infrastructure/repositories/certification-course-repository'),
  competenceMarkRepository: require('../../infrastructure/repositories/competence-mark-repository'),
  competenceRepository: require('../../infrastructure/repositories/competence-repository'),
  knowledgeElementRepository: require('../../infrastructure/repositories/knowledge-element-repository'),
  scoringCertificationService: require('../services/scoring/scoring-certification-service'),
  skillRepository: require('../../infrastructure/repositories/skill-repository'),
};

const partnerCertificationRepository = injectDependencies(
  require('../../infrastructure/repositories/partner-certification-repository'),
  dependencies
);
dependencies.partnerCertificationRepository = partnerCertificationRepository;

const handlersToBeInjected = {
  handleBadgeAcquisition: require('./handle-badge-acquisition'),
  handleCertificationScoring: require('./handle-certification-scoring'),
  handlePartnerCertifications: require('./handle-partner-certification'),
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
    }
  }
};
