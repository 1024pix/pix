import { getInContext } from '../execution-context-manager.js';
import { tracing } from './helpers.js';

function instrumentJobHandle(jobName, jobControllerClass) {
  const originalHandle = jobControllerClass.prototype.handle;
  jobControllerClass.prototype.handle = tracing.spanify(`job.${jobName}.handle`, originalHandle, () => {
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
