import { config } from '../../../../src/shared/config.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { MonitoringJobExecutionTimeHandler } from './MonitoringJobExecutionTimeHandler.js';

const { teamSize, teamConcurrency } = config.pgBoss;

class MonitoredJobQueue {
  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  performJob(name, handlerClass, dependencies) {
    this.jobQueue.performJob(name, handlerClass, dependencies);

    const monitoringJobHandler = new MonitoringJobExecutionTimeHandler({ logger });
    this.jobQueue.pgBoss.onComplete(name, { teamSize, teamConcurrency }, (job) => {
      monitoringJobHandler.handle(job);
    });
  }

  async stop() {
    await this.jobQueue.stop();
  }
}

export { MonitoredJobQueue };
