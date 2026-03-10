import { executeInContext } from '../async-local-storage.js';
import { logger } from '../utils/logger.js';
import { MonitoredJobHandler } from './monitoring/MonitoredJobHandler.js';
import { MonitoringJobExecutionTimeHandler } from './monitoring/MonitoringJobExecutionTimeHandler.js';

class JobQueue {
  constructor(pgBoss) {
    this.pgBoss = pgBoss;
  }

  register(metrics, name, handlerClass) {
    const jobHandler = new handlerClass();
    const { teamConcurrency, teamSize } = jobHandler;
    this.pgBoss.work(name, { teamSize, teamConcurrency }, async (job) => {
      return executeInContext({ jobId: job.id }, async () => {
        const monitoredJobHandler = new MonitoredJobHandler(metrics, jobHandler, logger);
        return monitoredJobHandler.handle({ data: job.data, jobName: name, jobId: job.id });
      });
    });

    this.pgBoss.onComplete(name, { teamSize, teamConcurrency }, (job) => {
      return executeInContext({ jobId: job.id }, async () => {
        const monitoringJobHandler = new MonitoringJobExecutionTimeHandler({ logger });
        return monitoringJobHandler.handle(job);
      });
    });
  }

  scheduleCronJob({ name, cron, data, options }) {
    return this.pgBoss.schedule(name, cron, data, options);
  }

  unscheduleCronJob(name) {
    return this.pgBoss.unschedule(name);
  }

  async stop() {
    await this.pgBoss.stop({ graceful: false, timeout: 1000, destroy: true });
  }
}

export { JobQueue };
