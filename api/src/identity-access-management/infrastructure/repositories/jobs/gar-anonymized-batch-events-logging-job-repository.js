import { JobRepository, JobRetry } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { GarAnonymizedBatchEventsLoggingJob } from '../../../domain/models/GarAnonymizedBatchEventsLoggingJob.js';

class GarAnonymizedBatchEventsLoggingJobRepository extends JobRepository {
  constructor() {
    super({
      name: GarAnonymizedBatchEventsLoggingJob.name,
      retry: JobRetry.STANDARD_RETRY,
    });
  }
}

export const garAnonymizedBatchEventsLoggingJobRepository = new GarAnonymizedBatchEventsLoggingJobRepository();
