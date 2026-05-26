import { glob } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PgBoss } from 'pg-boss';

import { config } from '../../config.js';
import { executeInContext, EXECUTORS } from '../execution-context-manager.js';
import { DatadogMetrics } from '../metrics/datadog-metrics.js';
import { importNamedExportFromFile } from '../utils/import-named-exports-from-directory.js';
import { child } from '../utils/logger.js';
import { MonitoredJobHandler } from './MonitoredJobHandler.js';

const workerDirPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const logger = child('worker', { event: 'worker' });
const metrics = new DatadogMetrics({ config });

export class JobClient {
  /** @type JobClient */
  static #jobClient;

  /** @type {PgBoss} */
  #pgBoss = null;
  #isTestOnly = false;
  #isInitialized = false;

  static get instance() {
    if (!JobClient.#jobClient) {
      JobClient.#jobClient = new JobClient();
    }
    return JobClient.#jobClient;
  }

  async initialize(
    { worker, isTestOnly, jobGroups } = { worker: false, isTestOnly: false, jobGroups: [] },
    pgBossFactory,
  ) {
    if (this.#isInitialized) return;
    this.#isTestOnly = isTestOnly;

    const connectionString =
      process.env.NODE_ENV === 'test' ? process.env.TEST_JOBS_DATABASE_URL : process.env.JOBS_DATABASE_URL;

    if (worker) {
      this.#pgBoss = pgBossFactory
        ? pgBossFactory()
        : new PgBoss({
            connectionString,
            max: config.pgBoss.workerConnexionPoolMaxSize,
            persistWarnings: config.pgBoss.persistWarnings,
            warningRetentionDays: 30,
          });

      this.#pgBoss.on('error', (err) => {
        logger.error({ event: 'pg-boss-error', err }, 'PGBOSS ERROR');
      });
      this.#pgBoss.on('warning', ({ message, data }) => {
        logger.warn({ event: 'pg-boss-warning', data }, message);
      });
      this.#pgBoss.on('wip', (data) => {
        logger.info({ event: 'pg-boss-wip', data }, 'PGBOSS WIP');
      });

      await this.#pgBoss.start();
      await this.#registerJobs(jobGroups);
    } else {
      this.#pgBoss = pgBossFactory
        ? pgBossFactory()
        : new PgBoss({
            connectionString,
            max: config.pgBoss.clientConnexionPoolMaxSize,
            supervise: false,
            schedule: false,
          });
      await this.#pgBoss.start();
    }

    this.#isInitialized = true;
  }

  #assertIsInitialized() {
    if (!this.#isInitialized) {
      throw new Error('JobClient has not been initialized before use');
    }
  }

  async #registerJobs(jobGroups = []) {
    const globPattern = `${workerDirPath}/src/**/application/**/*job-controller.js`;

    logger.info(`Search for job handlers in ${globPattern}`);
    const jobFiles = await Array.fromAsync(glob(globPattern, { exclude: ['**/job-controller.js'] }));
    logger.info(`${jobFiles.length} job handlers files found.`);

    let jobModules = {};
    for (const jobFile of jobFiles) {
      const fileModules = await importNamedExportFromFile(jobFile);
      jobModules = { ...jobModules, ...fileModules };
    }

    let jobRegisteredCount = 0;
    let cronJobCount = 0;
    for (const [moduleName, ModuleClass] of Object.entries(jobModules)) {
      const job = new ModuleClass();

      if (!jobGroups.includes(job.jobGroup) && !this.#isTestOnly) continue;

      if (job.isJobEnabled) {
        logger.info(`Job "${job.jobName}" registered from module "${moduleName}."`);
        await this.registerJob(job.jobName, ModuleClass);

        if (!job.jobCron && job.legacyName) {
          logger.warn(`Temporary Job" ${job.legacyName}" registered from module "${moduleName}."`);
          await this.registerJob(job.legacyName, ModuleClass);
        }

        if (job.jobCron) {
          await this.scheduleCronJob({
            name: job.jobName,
            cron: job.jobCron,
            options: { tz: 'Europe/Paris', expireInSeconds: job.expireIn },
          });
          logger.info(`Cron for job "${job.jobName}" scheduled "${job.jobCron}"`);

          // For cronJob we need to unschedule older cron
          if (job.legacyName) {
            await this.#unscheduleCronJob(job.legacyName);
          }

          cronJobCount++;
        } else {
          jobRegisteredCount++;
        }
      } else {
        logger.warn(`Job "${job.jobName}" is disabled.`);

        // For cronJob we need to unschedule older cron
        if (job.jobCron) {
          await this.#unscheduleCronJob(job.jobName);
          logger.info(`Job CRON "${job.jobName}" is unscheduled.`);
        }
      }
    }
    logger.info(`${jobRegisteredCount} jobs registered for groups "${jobGroups}".`);
    logger.info(`${cronJobCount} cron jobs scheduled for groups "${jobGroups}".`);
  }

  async registerJob(name, handlerClass) {
    await this.#pgBoss.createQueue(name, { retentionSeconds: config.pgBoss.retentionSeconds });

    if (this.#isTestOnly) return;

    const jobHandler = new handlerClass();

    const { localConcurrency } = jobHandler;

    await this.#pgBoss.work(name, { localConcurrency, includeMetadata: true }, async ([job]) => {
      const context = this.#initLogContext(job);
      return executeInContext(
        context,
        async () => {
          const monitoredJobHandler = new MonitoredJobHandler(metrics, jobHandler, logger);
          return monitoredJobHandler.handle(name, job);
        },
        EXECUTORS.JOB,
      );
    });
  }

  #initLogContext(job) {
    const inheritedContext = job.data?.correlationContext ?? {};
    return {
      ...inheritedContext,
      jobId: job.id,
    };
  }

  async scheduleCronJob({ name, cron, data, options }) {
    await this.#pgBoss.createQueue(name, { retentionSeconds: config.pgBoss.retentionSeconds });
    return this.#pgBoss.schedule(name, cron, data, options);
  }

  async #unscheduleCronJob(name) {
    return this.#pgBoss.unschedule(name);
  }

  async send(name, payload, options) {
    this.#assertIsInitialized();
    logger.info({ type: 'JOB_LOG', handlerName: name }, 'PGBOSS JOB CREATED');
    await this.#pgBoss.send(name, payload, options);
  }

  async fetch(name, options) {
    this.#assertIsInitialized();
    return this.#pgBoss.fetch(name, options);
  }

  async getSchedules() {
    this.#assertIsInitialized();
    return this.#pgBoss.getSchedules();
  }

  async flushJobs() {
    this.#assertIsInitialized();
    await this.#pgBoss.deleteAllJobs();
  }

  async stop(options = { graceful: false, timeout: 1000 }) {
    this.#assertIsInitialized();
    await this.#pgBoss.stop(options);
    this.#isInitialized = false;
  }

  async getQueuesStats() {
    const queues = await this.#pgBoss.getQueues();
    const emptyStat = {
      pending: 0,
      created: 0,
      retry: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      failed: 0,
      all: 0,
    };

    const stats = { global: { ...emptyStat } };

    for (const queue of queues) {
      stats[queue.name] = { ...emptyStat };
    }

    const { rows } = await this.#pgBoss
      .getDb()
      .executeSql('SELECT name, state, COUNT(id) FROM pgboss.job GROUP BY 1, 2');

    for (const row of rows) {
      stats[row.name] = { ...stats[row.name], [row.state]: row.count, all: (stats[row.name].all += row.count) };
      stats.global[row.state] += row.count;
      stats.global.all += row.count;
    }
    return stats;
  }
}
