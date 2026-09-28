import { ReplicationJob } from '../domain/models/ReplicationJob.js';
import { replications } from '../infrastructure/replications.ts';
import { replicationJobRepository } from '../infrastructure/repositories/jobs/replication-job-repository.js';

export const replicate = async (request, h, dependencies = { replications, replicationJobRepository }) => {
  const { replications, replicationJobRepository } = dependencies;
  const { replicationName } = request.params;

  if (!Object.hasOwn(replications, replicationName)) {
    return h.response().code(404);
  }

  await replicationJobRepository.performAsync(new ReplicationJob({ replicationName }));

  return h.response().code(204);
};
