import logger from '../../infrastructure/logger';
import MonitoredJobHandler from './monitoring/MonitoredJobHandler';
import participantResultsSharedRepository from '../repositories/participant-results-shared-repository';
import campaignParticipationRepository from '../repositories/campaign-participation-repository';
function build(classToInstanciate) {
  const dependencies = _buildDependencies();

  const handler = new classToInstanciate(dependencies);
  const monitoredJobHandler = new MonitoredJobHandler(handler, logger);
  return monitoredJobHandler;
}

function _buildDependencies() {
  return {
    participantResultsSharedRepository,
    campaignParticipationRepository,
  };
}

export default {
  build,
};
