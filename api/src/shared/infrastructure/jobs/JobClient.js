import { glob } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PgBoss } from 'pg-boss';

import { config } from '../../../../config/config.js';
import { executeInContext, EXECUTORS } from '../execution-context-manager.js';
import { instrumentJobController } from '../open-telemetry/job-tracing.js';
import { importNamedExportFromFile } from '../utils/import-named-exports-from-directory.js';
import { child } from '../utils/logger.js';
import { MonitoredJobHandler } from './MonitoredJobHandler.js';

const workerDirPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const logger = child('worker', { event: 'worker' });

const JOB_CONTROLLER_FILE_SUFFIX = 'job-controller.js';
const EVENT_HANDLER_FILE_SUFFIX = 'event-handler.js';
const BASE_CLASS_FILES = ['**/job-controller.js', '**/event-handler.js', '**/job-schedule-controller.js'];

const RegistrationKind = {
  JOB: 'job',
  EVENT_HANDLER: 'eventHandler',
  CRON: 'cron',
};

// JobScheduleController always sets jobCron, possibly to an empty value
const isScheduleController = (job) => 'jobCron' in job;

const queueOptionsOf = (job) => ({ isDeadLetterQueueEnabled: job.isDeadLetterQueueEnabled });

const createWorkerPgBoss = (isTestOnly) =>
  new PgBoss({
    connectionString: config.database.jobsUrl,
    max: config.pgBoss.workerConnexionPoolMaxSize,
    persistWarnings: config.pgBoss.persistWarnings,
    persistQueueStats: config.pgBoss.persistQueueStats,
    maintenanceIntervalSeconds: config.pgBoss.maintenanceIntervalSeconds,
    warningRetentionDays: 30,
    useListenNotify: config.pgBoss.useListenNotify && !isTestOnly,
    supervise: !isTestOnly,
    schedule: !isTestOnly,
  });

const createClientPgBoss = () =>
  new PgBoss({
    connectionString: config.database.jobsUrl,
    max: config.pgBoss.clientConnexionPoolMaxSize,
    supervise: false,
    schedule: false,
  });

export class JobClient {
  /** @type JobClient */
  static #jobClient;

  /** @type {PgBoss} */
  #pgBoss = null;
  #isTestOnly = false;
  #usesFixtureJobs = false;
  #isInitialized = false;

  static get instance() {
    if (!JobClient.#jobClient) {
      JobClient.#jobClient = new JobClient();
    }
    return JobClient.#jobClient;
  }

  get isInitialized() {
    return this.#isInitialized;
  }

  async initialize(
    { worker, isTestOnly, jobGroups } = { worker: false, isTestOnly: false, jobGroups: [] },
    pgBossFactory,
  ) {
    if (this.#isInitialized) return;
    this.#isTestOnly = isTestOnly;
    this.#usesFixtureJobs = Boolean(pgBossFactory);

    if (pgBossFactory) {
      this.#pgBoss = pgBossFactory();
    } else {
      this.#pgBoss = worker ? createWorkerPgBoss(isTestOnly) : createClientPgBoss();
    }

    this.#pgBoss.on('error', (err) => {
      logger.error({ event: 'pg-boss-error', err }, 'PGBOSS ERROR');
    });
    this.#pgBoss.on('warning', ({ message, data }) => {
      logger.warn({ event: 'pg-boss-warning', data }, message);
    });

    await this.#pgBoss.start();

    if (worker) {
      await this.#ensureDeadLetterQueue();
      await this.#registerJobs(jobGroups);
    }

    this.#isInitialized = true;
  }

  #assertIsInitialized() {
    if (!this.#isInitialized) {
      throw new Error('JobClient has not been initialized before use');
    }
  }

  async #registerJobs(jobGroups = []) {
    const jobFiles = await this.#findJobFiles();
    const jobModules = await this.#importJobModules(jobFiles);

    const counts = { [RegistrationKind.JOB]: 0, [RegistrationKind.EVENT_HANDLER]: 0, [RegistrationKind.CRON]: 0 };
    for (const [moduleName, ModuleClass] of jobModules) {
      const job = new ModuleClass();

      instrumentJobController(moduleName, ModuleClass);

      if (!jobGroups.includes(job.jobGroup) && !this.#isTestOnly) continue;

      if (job.isJobEnabled) {
        const registrationKind = await this.#registerEnabledJob(job, moduleName, ModuleClass);
        counts[registrationKind]++;
      } else {
        await this.#unregisterDisabledJob(job, moduleName, ModuleClass);
      }
    }

    logger.info(`${counts[RegistrationKind.JOB]} jobs registered for groups "${jobGroups}".`);
    logger.info(`${counts[RegistrationKind.EVENT_HANDLER]} event handler subscribed for groups "${jobGroups}".`);
    logger.info(`${counts[RegistrationKind.CRON]} cron jobs scheduled for groups "${jobGroups}".`);
  }

  #filePatterns(fileSuffix) {
    const sourcePattern = `${workerDirPath}/src/**/application/**/*${fileSuffix}`;
    const fixturePattern = `${workerDirPath}/tests/**/*${fileSuffix}`;
    return this.#usesFixtureJobs ? [sourcePattern, fixturePattern] : [sourcePattern];
  }

  async #findJobFiles() {
    const jobControllerPatterns = this.#filePatterns(JOB_CONTROLLER_FILE_SUFFIX);
    const eventHandlerPatterns = this.#filePatterns(EVENT_HANDLER_FILE_SUFFIX);
    logger.info(`Search for job handlers in ${jobControllerPatterns}`);
    logger.info(`Search for event handlers in ${eventHandlerPatterns}`);

    const jobFiles = [];
    for (const pattern of [...jobControllerPatterns, ...eventHandlerPatterns]) {
      jobFiles.push(...(await Array.fromAsync(glob(pattern, { exclude: BASE_CLASS_FILES }))));
    }
    logger.info(`${jobFiles.length} job handlers files found.`);

    return jobFiles;
  }

  /**
   * @param {Array<string>} jobFiles
   * @returns {Promise<Array<[string, Function]>>} the [export name, controller class] pairs of every file
   */
  async #importJobModules(jobFiles) {
    const jobModules = {};
    for (const jobFile of jobFiles) {
      Object.assign(jobModules, await importNamedExportFromFile(jobFile));
    }
    return Object.entries(jobModules);
  }

  /**
   * @returns {Promise<string>} the RegistrationKind the job has been registered as
   */
  async #registerEnabledJob(job, moduleName, ModuleClass) {
    logger.info(`Job "${job.jobName}" registered from module "${moduleName}."`);
    await this.registerJob(job.jobName, ModuleClass, queueOptionsOf(job));

    if (job.jobCron) {
      await this.#scheduleEnabledJob(job);
      return RegistrationKind.CRON;
    }

    if (job.legacyName) {
      logger.warn(`Temporary Job" ${job.legacyName}" registered from module "${moduleName}."`);
      await this.registerJob(job.legacyName, ModuleClass, queueOptionsOf(job));
    }

    if (job.eventName) {
      await this.#pgBoss.subscribe(job.eventName, job.jobName);
      return RegistrationKind.EVENT_HANDLER;
    }

    // A schedule controller whose cron has been removed keeps its worker,
    // but the schedule left by a previous deployment must not fire anymore
    if (isScheduleController(job)) {
      await this.#unscheduleJob(job);
    }
    return RegistrationKind.JOB;
  }

  async #scheduleEnabledJob(job) {
    await this.scheduleCronJob({
      name: job.jobName,
      cron: job.jobCron,
      options: { tz: 'Europe/Paris', expireInSeconds: job.expireIn },
    });
    logger.info(`Cron for job "${job.jobName}" scheduled "${job.jobCron}"`);

    // The schedule created under the legacy name must not fire anymore
    if (job.legacyName) {
      await this.#pgBoss.unschedule(job.legacyName);
    }
  }

  async #unregisterDisabledJob(job, moduleName, ModuleClass) {
    logger.warn(`Job "${job.jobName}" is disabled.`);

    // Unschedule by name whatever the cron: a controller may be disabled
    // precisely because its cron has been removed
    if (isScheduleController(job)) {
      await this.#unscheduleJob(job);
    } else if (job.eventName) {
      await this.#unsubscribeDisabledEventHandler(job, moduleName, ModuleClass);
    }
  }

  async #unscheduleJob(job) {
    await this.#pgBoss.unschedule(job.jobName);
    logger.info(`Job CRON "${job.jobName}" is unscheduled.`);
  }

  // The events already queued are still consumed; the queue is deleted once it is empty
  async #unsubscribeDisabledEventHandler(job, moduleName, ModuleClass) {
    await this.#pgBoss.unsubscribe(job.eventName, job.jobName);
    logger.info(`Event handler "${job.jobName}" unsubscribed from "${job.eventName}".`);

    const stats = await this.#pgBoss.getQueueStats(job.jobName);

    if (stats.queuedCount > 0) {
      logger.info(`Event handler "${job.jobName}" has ${stats.queuedCount} pending events.`);
      logger.info(`Job "${job.jobName}" registered from module "${moduleName}."`);
      await this.registerJob(job.jobName, ModuleClass, queueOptionsOf(job));
    } else {
      await this.#pgBoss.deleteQueue(job.jobName);

      logger.info(`Event handler "${job.jobName}" subscribed for "${job.eventName}". No pending events.`);
    }
  }

  async registerJob(name, handlerClass, { isDeadLetterQueueEnabled } = {}) {
    await this.#ensureQueue(name, { isDeadLetterQueueEnabled });

    if (this.#isTestOnly) return;

    const jobHandler = new handlerClass();

    const { localConcurrency } = jobHandler;

    await this.#pgBoss.work(name, { localConcurrency, includeMetadata: true }, async ([job]) => {
      const context = {
        ...this.#initLogContext(job),
        openTelemetryContext: this.#initOpenTelemetryContext(job),
      };
      return executeInContext(
        context,
        async () => {
          const monitoredJobHandler = new MonitoredJobHandler(jobHandler, logger);
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

  #initOpenTelemetryContext(job) {
    return job.data?.openTelemetryContext;
  }

  async scheduleCronJob({ name, cron, data, options }) {
    await this.#ensureQueue(name);
    return this.#pgBoss.schedule(name, cron, data, options);
  }

  // createQueue does not update an existing queue (ON CONFLICT DO NOTHING), so options
  // must be re-applied through updateQueue to reach queues created by previous deployments
  async #ensureQueue(name, { isDeadLetterQueueEnabled } = {}) {
    const options = {
      retentionSeconds: config.pgBoss.retentionSeconds,
      notify: config.pgBoss.useListenNotify && !this.#isTestOnly,
    };
    if (isDeadLetterQueueEnabled) {
      options.deadLetter = config.pgBoss.deadLetterQueueName;
    }
    await this.#pgBoss.createQueue(name, options);
    await this.#pgBoss.updateQueue(name, options);
  }

  async #ensureDeadLetterQueue() {
    const options = { retentionSeconds: config.pgBoss.deadLetterQueueRetentionSeconds };
    await this.#pgBoss.createQueue(config.pgBoss.deadLetterQueueName, options);
    await this.#pgBoss.updateQueue(config.pgBoss.deadLetterQueueName, options);
  }

  async publishEvent(name, payload, options) {
    this.#assertIsInitialized();
    logger.info({ type: 'EVENT_LOG', handlerName: name }, 'PGBOSS EVENT PUBLISHED');
    await this.#pgBoss.publish(name, payload, options);
  }

  /**
   * Enqueues a single job on a single queue
   *
   * @param {string} name - The name of the queue
   * @param {*} job - The job payload
   * @param {object} [options] - PgBoss job options
   * @returns {Promise<void>}
   */
  async send(name, job, options) {
    await this.#sendMany(name, [job], options);
    logger.info({ type: 'JOB_LOG', handlerName: name, jobCount: 1 }, '1 PGBOSS JOB CREATED');
  }

  /**
   * Enqueues multiple jobs on a single queue
   *
   * @param {string} name - The name of the queue
   * @param {Array<*>} jobs - The job payloads to enqueue
   * @param {object} [options] - PgBoss job options applied to every job
   * @returns {Promise<void>}
   */
  async sendMany(name, jobs, options) {
    await this.#sendMany(name, jobs, options);
    logger.info({ type: 'JOB_LOG', handlerName: name, jobCount: jobs.length }, `${jobs.length} PGBOSS JOBS CREATED`);
  }

  async #sendMany(name, jobs, options) {
    this.#assertIsInitialized();

    if (jobs.length === 0) return;

    const jobsWithOptions = jobs.map((data) => ({
      data,
      ...options,
    }));

    await this.#pgBoss.insert(name, jobsWithOptions);
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

  async stop(options = { graceful: true, timeout: 20000 }) {
    this.#assertIsInitialized();
    await this.#pgBoss.stop(options);
    this.#isInitialized = false;
  }

  async getQueuesStats() {
    const queues = await this.#pgBoss.getQueues();
    const stats = [];
    for (const queue of queues) {
      const snapshots = await this.#pgBoss.getQueueStats(queue.name, { limit: 1, percentiles: [50, 95, 99] });
      stats.push(...snapshots);
    }
    return stats;
  }
}
