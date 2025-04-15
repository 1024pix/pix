import { JobRepository, JobRetry } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ReplicationJob } from '../../../domain/models/ReplicationJob.js';

export const replicationJobRepository = new JobRepository({
  name: ReplicationJob.name,
  retry: JobRetry.FEW_RETRY,
});
