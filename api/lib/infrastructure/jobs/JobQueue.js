import { MonitoredJobHandler } from './monitoring/MonitoredJobHandler.js';
import { logger } from '../logger.js';
import { config } from '../../config.js';

const { teamSize, teamConcurrency } = config.pgBoss;

class JobQueue {
  constructor(pgBoss) {
    this.pgBoss = pgBoss;
  }

  performJob(name, handlerClass, dependencies) {
    this.pgBoss.work(name, { teamSize, teamConcurrency }, async (job) => {
      const jobHandler = new handlerClass(dependencies);
      const monitoredJobHandler = new MonitoredJobHandler(jobHandler, logger);
      return monitoredJobHandler.handle(job.data);
    });
  }

  async stop() {
    await this.pgBoss.stop({ graceful: false, timeout: 1000 });
  }
}

export { JobQueue };
