import MonitoringJobHandler from './MonitoringJobExecutionTimeHandler';
import logger from '../../logger';
import { pgBoss } from '../../../config';

const { teamSize: teamSize, teamConcurrency: teamConcurrency } = pgBoss;

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

export default MonitoredJobQueue;
