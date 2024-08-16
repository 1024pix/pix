import { JobPgBoss } from '../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { GarAnonymizedBatchEventsLoggingJob } from '../../../domain/models/GarAnonymizedBatchEventsLoggingJob.js';

class GarAnonymizedBatchEventsLoggingJobRepository extends JobPgBoss {
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
