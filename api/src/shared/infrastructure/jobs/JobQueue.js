import { config } from '../../config.js';
import { logger } from '../utils/logger.js';
import { MonitoredJobHandler } from './monitoring/MonitoredJobHandler.js';
import { MonitoringJobExecutionTimeHandler } from './monitoring/MonitoringJobExecutionTimeHandler.js';
const { teamSize, teamConcurrency } = config.pgBoss;

class JobQueue {
  constructor(pgBoss) {
    this.pgBoss = pgBoss;
  }

  registerJob(name, handlerClass, dependencies) {
    this.pgBoss.work(name, { teamSize, teamConcurrency }, async (job) => {
      const jobHandler = new handlerClass({ ...dependencies, logger });
      const monitoredJobHandler = new MonitoredJobHandler(jobHandler, logger);
      return monitoredJobHandler.handle(job.data, name);
    });

    this.pgBoss.onComplete(name, { teamSize, teamConcurrency }, (job) => {
      const monitoringJobHandler = new MonitoringJobExecutionTimeHandler({ logger });
      monitoringJobHandler.handle(job);
    });
  }

  async stop() {
    await this.pgBoss.stop({ graceful: false, timeout: 1000, destroy: true });
  }
}

export { JobQueue };
