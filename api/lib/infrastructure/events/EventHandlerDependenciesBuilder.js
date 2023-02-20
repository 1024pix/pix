import monitoringTools from '../../infrastructure/monitoring-tools';
import ParticipationResultCalculationJob from '../jobs/campaign-result/ParticipationResultCalculationJob';
import SendSharedParticipationResultsToPoleEmploiJob from '../jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiJob';

function build(classToInstanciate, domainTransaction) {
  const dependencies = _buildDependencies(domainTransaction);

  const instance = new classToInstanciate(dependencies);
  return new EventErrorHandler(instance, monitoringTools);
}

function _buildDependencies(domainTransaction) {
  return {
    monitoringTools,
    participationResultCalculationJob: new ParticipationResultCalculationJob(domainTransaction.knexTransaction),
    sendSharedParticipationResultsToPoleEmploiJob: new SendSharedParticipationResultsToPoleEmploiJob(
      domainTransaction.knexTransaction
    ),
  };
}

export default {
  build,
};

class EventErrorHandler {
  constructor(handler, logger) {
    this.handler = handler;
    this.logger = logger;
  }

  async handle(event) {
    let result;
    try {
      this.logHandlerStarting(event);
      result = await this.handler.handle(event);
    } catch (error) {
      this.logHandlerFailed(event, error);
      throw error;
    }
    return result;
  }

  logHandlerStarting(event) {
    this.logger.logInfoWithCorrelationIds({
      message: {
        event,
        handlerName: this.handler.name,
        type: 'EVENT_LOG',
        info: 'EventBus : Event dispatched',
      },
    });
  }

  logHandlerFailed(event, error) {
    this.logger.logErrorWithCorrelationIds({
      message: {
        event,
        handlerName: this.handler.name,
        error: error?.message ? error.message + ' (see dedicated log for more information)' : undefined,
        type: 'EVENT_LOG_ERROR',
        info: 'EventBus : Event Handling Error',
      },
    });
  }
}
