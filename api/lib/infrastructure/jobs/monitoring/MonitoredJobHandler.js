import { logErrorWithCorrelationIds, logInfoWithCorrelationIds } from '../../monitoring-tools.js';

class MonitoredJobHandler {
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
    logInfoWithCorrelationIds({
      data,
      handlerName: this.handler.name,
      type: 'JOB_LOG',
      message: 'Job Started',
    });
  }

  logJobFailed(data, error) {
    logErrorWithCorrelationIds({
      data,
      handlerName: this.handler.name,
      error: error?.message ? error.message + ' (see dedicated log for more information)' : undefined,
      type: 'JOB_LOG_ERROR',
      message: 'Job failed',
    });
  }
}

export { MonitoredJobHandler };
