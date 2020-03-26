const { injectDependencies } = require('../../infrastructure/utils/dependency-injection');

const dependencies = {
  badgeAcquisitionRepository: require('../../infrastructure/repositories/badge-acquisition-repository'),
  badgeCriteriaService: require('../services/badge-criteria-service'),
  badgeRepository: require('../../infrastructure/repositories/badge-repository'),
  campaignParticipationResultRepository: require('../../infrastructure/repositories/campaign-participation-result-repository'),
  assessmentResultRepository: require('../../infrastructure/repositories/assessment-result-repository'),
  certificationCourseRepository: require('../../infrastructure/repositories/certification-course-repository'),
  competenceMarkRepository: require('../../infrastructure/repositories/competence-mark-repository'),
  scoringCertificationService: require('../services/scoring/scoring-certification-service'),
  assessmentRepository: require('../../infrastructure/repositories/assessment-repository'),
  certificationPartnerAcquisitionRepository: require('../../infrastructure/repositories/certification-partner-acquisition-repository'),
};

module.exports = injectDependencies({
  handleBadgeAcquisition: require('./handle-badge-acquisition'),
  handleCertificationScoring: require('./handle-certification-scoring'),
}, dependencies);
