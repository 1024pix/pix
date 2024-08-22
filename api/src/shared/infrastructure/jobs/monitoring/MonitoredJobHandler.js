class MonitoredJobHandler {
  constructor(handler, logger) {
    this.handler = handler;
    this.logger = logger;
  }

  async handle({ data, jobName, jobId }) {
    let result;
    try {
      this.logJobStarting({ data, jobName });
      result = await this.handler.handle(data, { jobId });
    } catch (error) {
      this.logJobFailed({ data, error, jobName });
      throw error;
    }
    return result;
  }

  logJobStarting({ data, jobName }) {
    this.logger.info({
      data,
      handlerName: jobName,
      type: 'JOB_LOG',
      message: 'Job Started',
    });
  }

  logJobFailed({ data, jobName, error }) {
    this.logger.error({
      data,
      handlerName: jobName,
      error: error?.message ? error.message + ' (see dedicated log for more information)' : undefined,
      type: 'JOB_LOG_ERROR',
      message: 'Job failed',
    });
  }
}

export { MonitoredJobHandler };
