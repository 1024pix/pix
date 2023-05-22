import { MonitoringJobExecutionTimeHandler } from './MonitoringJobExecutionTimeHandler.js';
import { logger } from '../../logger.js';
import { config } from '../../../config.js';

const { teamSize, teamConcurrency } = config.pgBoss;

class MonitoredJobQueue {
  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  performJob(name, handlerClass) {
    this.jobQueue.performJob(name, handlerClass);

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
