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
      return monitoredJobHandler.handle({ data: job.data, jobName: name, jobId: job.id });
    });

    this.pgBoss.onComplete(name, { teamSize, teamConcurrency }, (job) => {
      const monitoringJobHandler = new MonitoringJobExecutionTimeHandler({ logger });
      monitoringJobHandler.handle(job);
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
