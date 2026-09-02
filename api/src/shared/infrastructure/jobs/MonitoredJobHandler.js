import dayjs from 'dayjs';

class MonitoredJobHandler {
  constructor(handler, logger) {
    this.handler = handler;
    this.logger = logger;
  }

  async handle(name, job) {
    let result;
    try {
      this.logJobStarting(name, job);
      result = await this.handler.handle({ data: job.data, jobId: job.id });
    } catch (error) {
      this.logJobFailed(name, job, error);
      throw error;
    }
    this.logJobCompleted(name, job);
    return result;
  }

  logJobStarting(name, job) {
    this.logger.info(
      {
        type: 'JOB_LOG',
        jobId: job.id,
        data: job.data,
        handlerName: name,
      },
      'PGBOSS JOB STARTING',
    );
  }

  logJobCompleted(name, job) {
    const createdOn = dayjs(job.createdOn);
    const startedOn = dayjs(job.startedOn);
    const completedOn = dayjs();
    const totalTime = completedOn.diff(createdOn, 'second', true);
    const executionTime = completedOn.diff(startedOn, 'second', true);

    this.logger.info(
      {
        event: 'pg-boss-execution-time',
        type: 'JOB_LOG_EXEC_TIME',
        jobId: job.id,
        handlerName: name,
        executionTime,
        totalTime,
      },
      'PGBOSS JOB COMPLETED',
    );
  }

  logJobFailed(name, job, error) {
    this.logger.error(
      {
        type: 'JOB_LOG_ERROR',
        message: 'Job failed',
        jobId: job.id,
        data: job.data,
        handlerName: name,
        error: error?.message,
        stack: error?.stack,
      },
      'PGBOSS ERROR IN JOB',
    );
  }
}

export { MonitoredJobHandler };
