const MonitoringJobHandler = require('./MonitoringJobExecutionTimeHandler');
const logger = require('../../logger');

class MonitoredJobQueue {
  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  performJob(name, handlerClass) {
    this.jobQueue.performJob(name, handlerClass);

    const monitoringJobHandler = new MonitoringJobHandler({ logger });
    this.jobQueue.pgBoss.onComplete(name, (job) => {
      monitoringJobHandler.handle(job);
    });
  }

  async stop() {
    await this.jobQueue.stop();
  }
}

module.exports = MonitoredJobQueue;
