const MonitoringJobHandler = require('./MonitoringJobExecutionTimeHandler');
const logger = require('../../logger');
const _ = require('lodash');
const { teamSize, teamConcurrency } = require('../../../config').pgBoss;

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

    this.jobQueue.pgBoss.on('monitor-states', (state) => {
      logger.info({ event: 'pg-boss-state', name: 'global' }, { ...state, queues: undefined });
      _.each(state.queues, (queueState, queueName) => {
        logger.info({ event: 'pg-boss-state', name: queueName }, queueState);
      });
    });
    this.jobQueue.pgBoss.on('error', (err) => {
      logger.error({ event: 'pg-boss-error' }, err);
    });
  }

  async stop() {
    await this.jobQueue.stop();
  }
}

module.exports = MonitoredJobQueue;
