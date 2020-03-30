const _ = require('lodash');
const injectDefaults = require('../../infrastructure/utils/inject-defaults');

const dependencies = {
  badgeAcquisitionRepository: require('../../infrastructure/repositories/badge-acquisition-repository'),
  badgeCriteriaService: require('../services/badge-criteria-service'),
  badgeRepository: require('../../infrastructure/repositories/badge-repository'),
  campaignParticipationResultRepository: require('../../infrastructure/repositories/campaign-participation-result-repository'),
};

function injectDependencies(eventHandlers) {
  return _.mapValues(eventHandlers, _.partial(injectDefaults, dependencies));
}

module.exports = injectDependencies({
  handleBadgeAcquisition: require('./handle-badge-acquisition'),
});
