import { experimentJobRepository } from './jobs/experiment-job-repository.js';

export async function triggerJobExperiment(request) {
  return experimentJobRepository.performAsync({ error: request.query?.error });
}

export function monitorJobExperiment(request) {
  return experimentJobRepository.monitor(request.params.jobId);
}
