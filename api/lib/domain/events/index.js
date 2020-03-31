const { injectDependencies } = require('../../infrastructure/utils/dependency-injection');

const dependencies = {
  badgeAcquisitionRepository: require('../../infrastructure/repositories/badge-acquisition-repository'),
  badgeCriteriaService: require('../services/badge-criteria-service'),
  badgeRepository: require('../../infrastructure/repositories/badge-repository'),
  campaignParticipationResultRepository: require('../../infrastructure/repositories/campaign-participation-result-repository'),
};

module.exports = injectDependencies({
  handleBadgeAcquisition: require('./handle-badge-acquisition'),
}, dependencies);
