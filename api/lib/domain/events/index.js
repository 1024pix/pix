const { injectDependencies } = require('../../infrastructure/utils/dependency-injection');

const dependencies = {
  assessmentResultRepository: require('../../infrastructure/repositories/assessment-result-repository'),
  certificationAssessmentRepository: require('../../infrastructure/repositories/certification-assessment-repository'),
  badgeAcquisitionRepository: require('../../infrastructure/repositories/badge-acquisition-repository'),
  badgeCriteriaService: require('../services/badge-criteria-service'),
  badgeRepository: require('../../infrastructure/repositories/badge-repository'),
  campaignParticipationResultRepository: require('../../infrastructure/repositories/campaign-participation-result-repository'),
  certificationCourseRepository: require('../../infrastructure/repositories/certification-course-repository'),
  certificationPartnerAcquisitionRepository: require('../../infrastructure/repositories/certification-partner-acquisition-repository'),
  competenceMarkRepository: require('../../infrastructure/repositories/competence-mark-repository'),
  competenceRepository: require('../../infrastructure/repositories/competence-repository'),
  knowledgeElementRepository: require('../../infrastructure/repositories/knowledge-element-repository'),
  scoringCertificationService: require('../services/scoring/scoring-certification-service'),
  skillRepository: require('../../infrastructure/repositories/skill-repository'),
};

module.exports = injectDependencies({
  handleBadgeAcquisition: require('./handle-badge-acquisition'),
  handleCertificationScoring: require('./handle-certification-scoring'),
  handleCertificationAcquisitionForPartner: require('./handle-certification-partner'),
}, dependencies);
