import { logger } from '../utils/logger.js';
import { MonitoredJobHandler } from './monitoring/MonitoredJobHandler.js';
import { MonitoringJobExecutionTimeHandler } from './monitoring/MonitoringJobExecutionTimeHandler.js';

class JobQueue {
  constructor(pgBoss) {
    this.pgBoss = pgBoss;
  }

  register(name, handlerClass) {
    const jobHandler = new handlerClass();
    const { teamConcurrency, teamSize } = jobHandler;
    this.pgBoss.work(name, { teamSize, teamConcurrency }, async (job) => {
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
