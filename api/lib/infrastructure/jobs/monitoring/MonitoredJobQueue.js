import { MonitoringJobHandler } from './MonitoringJobExecutionTimeHandler.js';
import { logger } from '../../logger.js';
import { pgBoss } from '../../../config.js';

const { teamSize, teamConcurrency } = pgBoss;

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

export { MonitoredJobQueue };
