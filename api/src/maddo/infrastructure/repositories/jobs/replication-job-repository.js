import { JobRetry } from '../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ReplicationJob } from '../../../domain/models/ReplicationJob.js';

export const replicationJobRepository = new JobRepository({
  name: ReplicationJob.name,
  retry: JobRetry.FEW_RETRY,
});
