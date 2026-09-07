import os from 'node:os';

import { config } from '../../../../config/config.js';
import { JobClient } from '../../infrastructure/jobs/JobClient.js';
import { logger } from '../../infrastructure/utils/logger.js';
import { JobScheduleController } from './job-schedule-controller.js';

export class PgBossStatesMonitoringJobController extends JobScheduleController {
  constructor() {
    super('PgBossStatesMonitoring', { jobCron: config.pgBoss.statesMonitoringJobCron });
  }

  async handle({ dependencies = { logger } }) {
    // log ops metrics for worker
    const data = {
      osload: os.loadavg(),
      osmem: { total: os.totalmem(), free: os.freemem() },
      osup: os.uptime(),
      psup: process.uptime(),
      psmem: process.memoryUsage(),
      pscpu: process.cpuUsage(),
    };
    dependencies.logger.info({ type: 'WORKER_METRICS', tags: ['ops'], data }, 'PGBOSS WORKER METRICS');

    // log all queues stats
    const stats = await JobClient.instance.getQueuesStats();
    Object.keys(stats).forEach((queueName) => {
      dependencies.logger.info(
        { event: 'pg-boss-state', name: queueName, queue: stats[queueName] },
        'PGBOSS MONITOR-STATES',
      );
    });
  }
}
