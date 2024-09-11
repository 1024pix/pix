class MonitoredJobHandler {
  constructor(handler, logger) {
    this.handler = handler;
    this.logger = logger;
  }

  async handle({ data, jobName, jobId }) {
    let result;
    try {
      this.logJobStarting({ data, jobName, jobId });
      result = await this.handler.handle({ data, jobId });
    } catch (error) {
      this.logJobFailed({ data, error, jobName, jobId });
      throw error;
    }
    return result;
  }

  logJobStarting({ data, jobName, jobId }) {
    this.logger.info({
      data,
      handlerName: jobName,
      type: 'JOB_LOG',
      message: 'Job Started',
      jobId,
    });
  }

  logJobFailed({ data, jobName, jobId, error }) {
    this.logger.error({
      data,
      handlerName: jobName,
      error: error?.message ? error.message + ' (see dedicated log for more information)' : undefined,
      type: 'JOB_LOG_ERROR',
      message: 'Job failed',
      jobId,
    });
  }
}

export { MonitoredJobHandler };
