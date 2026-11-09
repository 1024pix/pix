import { config } from '../../../../config/config.js';
import { JobClient } from '../../infrastructure/jobs/JobClient.js';
import { logger } from '../../infrastructure/utils/logger.js';
import { JobScheduleController } from './job-schedule-controller.js';

const COUNT_FIELDS = ['deferredCount', 'queuedCount', 'readyCount', 'activeCount', 'failedCount', 'totalCount'];
const DELTA_FIELDS = ['completedDelta', 'failedDelta', 'createdDelta'];
const QUEUE_FIELDS = [...COUNT_FIELDS, ...DELTA_FIELDS, 'deltaSeconds', 'deltaOn', 'readyOldestSeconds', 'capturedOn'];

export class PgBossStatesMonitoringJobController extends JobScheduleController {
  constructor() {
    super('PgBossStatesMonitoring', { jobCron: config.pgBoss.statesMonitoringJobCron });
  }

  async handle({ dependencies = { logger, jobClient: JobClient.instance } }) {
    const queuesStats = await dependencies.jobClient.getQueuesStats();

    for (const queueStats of queuesStats) {
      const { name, percentiles } = queueStats;
      const stats = {};
      for (const field of QUEUE_FIELDS) {
        stats[field] = queueStats[field];
      }
      for (const { p, waitSeconds, runSeconds } of percentiles) {
        stats[`waitP${p}Seconds`] = waitSeconds;
        stats[`runP${p}Seconds`] = runSeconds;
      }
      dependencies.logger.info({ event: 'pg-boss-queue-stats', queue: name, stats }, 'PGBOSS QUEUE STATS');
    }

    dependencies.logger.info(
      { event: 'pg-boss-queue-stats', queue: 'global', stats: aggregateGlobalStats(queuesStats) },
      'PGBOSS QUEUE STATS',
    );
  }
}

function aggregateGlobalStats(queuesStats) {
  const nonNullValues = (field) => queuesStats.map((stats) => stats[field]).filter((value) => value != null);

  const globalStats = {};

  for (const field of COUNT_FIELDS) {
    globalStats[field] = queuesStats.reduce((sum, stats) => sum + stats[field], 0);
  }

  for (const field of DELTA_FIELDS) {
    const values = nonNullValues(field);
    globalStats[field] = values.length ? values.reduce((sum, value) => sum + value, 0) : null;
  }

  const values = nonNullValues('readyOldestSeconds');
  globalStats.readyOldestSeconds = values.length ? Math.max(...values) : null;

  return globalStats;
}
