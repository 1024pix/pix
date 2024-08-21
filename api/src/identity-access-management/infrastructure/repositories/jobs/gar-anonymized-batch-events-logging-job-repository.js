import { JobRepository } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { GarAnonymizedBatchEventsLoggingJob } from '../../../domain/models/GarAnonymizedBatchEventsLoggingJob.js';

class GarAnonymizedBatchEventsLoggingJobRepository extends JobRepository {
  constructor() {
    super({
      name: GarAnonymizedBatchEventsLoggingJob.name,
      retryLimit: 10,
      retryDelay: 30,
      retryBackoff: true,
    });
  }
}

export const garAnonymizedBatchEventsLoggingJobRepository = new GarAnonymizedBatchEventsLoggingJobRepository();
