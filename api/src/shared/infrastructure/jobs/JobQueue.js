import { logger } from '../utils/logger.js';
import { MonitoredJobHandler } from './monitoring/MonitoredJobHandler.js';

// TODO: renommer en JobQueues
class JobQueue {
  constructor(pgBoss) {
    this.pgBoss = pgBoss;
  }

  // TODO: renommer name en queue
  async register(metrics, name, handlerClass) {
    const jobHandler = new handlerClass();
    const { teamConcurrency, teamSize } = jobHandler;

    await this.pgBoss.createQueue(name);

    this.pgBoss.work(name, { teamSize, teamConcurrency }, async (job) => {
      const monitoredJobHandler = new MonitoredJobHandler(metrics, jobHandler, logger);
      return monitoredJobHandler.handle({ data: job.data, jobName: name, jobId: job.id });
    });

    // TODO: n'existe plus, à voir comment le remplacer
    // this.pgBoss.onComplete(name, { teamSize, teamConcurrency }, (job) => {
    //   const monitoringJobHandler = new MonitoringJobExecutionTimeHandler({ logger });
    //   monitoringJobHandler.handle(job);
    // });
  }

  async registerScheduleJob({ name, cron, data, options }) {
    await this.pgBoss.createQueue(name);
    return this.pgBoss.schedule(name, cron, data, options);
  }

  unscheduleCronJob(name) {
    return this.pgBoss.unschedule(name);
  }
}

export { JobQueue };
