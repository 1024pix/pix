const logger = require('../../infrastructure/logger');
const MonitoredJobHandler = require('./monitoring/MonitoredJobHandler');

function build(classToInstanciate) {
  const dependencies = _buildDependencies();

  const handler = new classToInstanciate(dependencies);
  const monitoredJobHandler = new MonitoredJobHandler(handler, logger);
  return monitoredJobHandler;
}

function _buildDependencies() {
  return {
    participantResultsSharedRepository: require('../repositories/participant-results-shared-repository'),
    campaignParticipationRepository: require('../repositories/campaign-participation-repository'),
    campaignRepository: require('../repositories/campaign-repository'),
    organizationRepository: require('../repositories/organization-repository'),
    userRepository: require('../repositories/user-repository'),
    targetProfileRepository: require('../repositories/target-profile-repository'),
    campaignParticipationResultRepository: require('../repositories/campaign-participation-result-repository'),
    poleEmploiSendingRepository: require('../repositories/pole-emploi-sending-repository'),
    poleEmploiNotifier: require('../externals/pole-emploi/pole-emploi-notifier'),
  };
}

module.exports = {
  build,
};
