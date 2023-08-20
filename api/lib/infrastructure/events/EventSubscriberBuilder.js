import { monitoringTools } from '../../infrastructure/monitoring-tools.js';

export function build(classToInstantiate, domainTransaction) {
  const instance = new classToInstantiate(domainTransaction);
  return new EventErrorHandler(instance, monitoringTools);
}

class EventErrorHandler {
  constructor(handler, logger) {
    this.handler = handler;
    this.logger = logger;
  }

  async handle(event) {
    let result;
    try {
      this.logHandlerStarting(event);
      result = await this.handler.schedule(event);
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
