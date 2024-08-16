import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { JobPgBoss } from '../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { GarAnonymizedBatchEventsLoggingJob } from '../../../domain/models/GarAnonymizedBatchEventsLoggingJob.js';

class GarAnonymizedBatchEventsLoggingJobRepository extends JobPgBoss {
  constructor() {
    super(
      {
        name: GarAnonymizedBatchEventsLoggingJob.name,
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
      },
      DomainTransaction.getConnection(),
    );
  }
}

export const garAnonymizedBatchEventsLoggingJobRepository = new GarAnonymizedBatchEventsLoggingJobRepository();
