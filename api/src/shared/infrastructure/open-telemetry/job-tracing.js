import { metrics } from '@opentelemetry/api';

import { getInContext } from '../execution-context-manager.js';
import { otelProxy } from './otel_proxy.js';

function instrumentJobHandle(jobName, jobControllerClass) {
  const originalHandle = jobControllerClass.prototype.handle;
  jobControllerClass.prototype.handle = otelProxy(originalHandle, `job.${jobName}.handle`, () => {
    const producerContext = getInContext('openTelemetryContext');
    return {
      kind: 4 /* SpanKind.CONSUMER */,
      links: producerContext ? [{ context: producerContext }] : [],
    };
  });
}

/**
 * Instruments a PGBoss JobController with automatic OpenTelemetry tracing
 * @param {typeof import('../../application/jobs/job-controller.js').JobController} jobControllerClass
 */
export function instrumentJobController(jobName, jobControllerClass) {
  instrumentJobHandle(jobName, jobControllerClass);
}

const JOB_STATES = ['created', 'pending', 'retry', 'active', 'cancelled', 'failed'];

export function registerPgBossMetrics(jobClient) {
  const meter = metrics.getMeter('pgboss');

  meter
    .createObservableGauge('pgboss.queue.jobs', {
      description: 'Number of pg-boss jobs per queue and state ("active" jobs are the ones currently in progress)',
      unit: '{job}',
    })
    .addCallback(async (observableResult) => {
      const stats = await jobClient.getQueuesStats();
      for (const [queueName, queueStats] of Object.entries(stats)) {
        if (queueName === 'global') continue;
        for (const state of JOB_STATES) {
          observableResult.observe(queueStats[state], { 'pgboss.queue.name': queueName, 'pgboss.job.state': state });
        }
      }
    });

  meter
    .createObservableGauge('pgboss.queue.oldest_pending_job_age', {
      description: 'Age in seconds of the oldest job still waiting to run (state "created" or "retry") per queue',
      unit: 's',
    })
    .addCallback(async (observableResult) => {
      const ages = await jobClient.getOldestPendingJobAges();
      for (const { name, ageInSeconds } of ages) {
        observableResult.observe(ageInSeconds, { 'pgboss.queue.name': name });
      }
    });
}
