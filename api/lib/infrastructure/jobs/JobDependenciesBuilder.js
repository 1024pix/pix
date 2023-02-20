import logger from '../../infrastructure/logger';
import MonitoredJobHandler from './monitoring/MonitoredJobHandler';

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
  };
}

export default {
  build,
};
