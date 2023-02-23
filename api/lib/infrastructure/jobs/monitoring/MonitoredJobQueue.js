const MonitoringJobHandler = require('./MonitoringJobExecutionTimeHandler.js');
const logger = require('../../logger.js');
const { teamSize, teamConcurrency } = require('../../../config.js').pgBoss;

class MonitoredJobQueue {
  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  performJob(name, handlerClass) {
    this.jobQueue.performJob(name, handlerClass);

    const monitoringJobHandler = new MonitoringJobHandler({ logger });
    this.jobQueue.pgBoss.onComplete(name, { teamSize, teamConcurrency }, (job) => {
      monitoringJobHandler.handle(job);
    });
  }

  async stop() {
    await this.jobQueue.stop();
  }
}

module.exports = MonitoredJobQueue;
