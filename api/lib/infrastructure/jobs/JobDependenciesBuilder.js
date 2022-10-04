const logger = require('../../infrastructure/logger');

function build(classToInstanciate) {
  const dependencies = _buildDependencies();

  const instance = new classToInstanciate(dependencies);
  const handler = new JobErrorHandler(instance, logger);
  return handler;
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

class JobErrorHandler {
  constructor(handler, logger) {
    this.handler = handler;
    this.logger = logger;
  }

  async handle(data) {
    let result;
    try {
      this.logJobStarting(data);
      result = await this.handler.handle(data);
    } catch (error) {
      this.logJobFailed(data, error);
      throw error;
    }
    return result;
  }

  logJobStarting(data) {
    this.logger.info({
      data,
      handlerName: this.handler.name,
      type: 'JOB_LOG',
      message: 'Job starting',
    });
  }

  logJobFailed(data, error) {
    this.logger.error({
      data,
      handlerName: this.handler.name,
      error: error?.message ? error.message + ' (see dedicated log for more information)' : undefined,
      type: 'JOB_LOG',
      message: 'Job failed',
    });
  }
}
