
import { otelProxy } from './otel_proxy.js';

function instrumentJobHandle(jobName, jobControllerClass) {
  const originalHandle = jobControllerClass.prototype.handle;
  jobControllerClass.prototype.handle = otelProxy(originalHandle, `job.${jobName}.handle`);
}

/**
 * Instruments a PGBoss JobController with automatic OpenTelemetry tracing
 * @param {typeof import('../../application/jobs/job-controller.js').JobController} jobControllerClass
 */
export function instrumentJobController(jobName, jobControllerClass) {
  instrumentJobHandle(jobName, jobControllerClass);
}
