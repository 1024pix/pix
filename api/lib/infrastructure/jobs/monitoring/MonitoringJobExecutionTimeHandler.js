const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/customParseFormat'));

class MonitoringJobExecutionTimeHandler {
  constructor({ logger }) {
    this.logger = logger;
  }

  async handle(job) {
    const createdOn = dayjs(job.data.createdOn);
    const startedOn = dayjs(job.data.startedOn);
    const completedOn = dayjs(job.data.completedOn);
    const totalTime = completedOn.diff(createdOn, 'second', true);
    const executionTime = completedOn.diff(startedOn, 'second', true);

    this.logger.info({
      event: 'pg-boss-execution-time',
      type: 'JOB_LOG_EXEC_TIME',
      handlerName: job.data.request.name,
      executionTime,
      totalTime,
    });
  }
}

module.exports = MonitoringJobExecutionTimeHandler;
