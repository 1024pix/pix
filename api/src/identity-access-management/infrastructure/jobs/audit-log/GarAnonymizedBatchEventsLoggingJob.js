import { JobPgBoss } from '../../../../../lib/infrastructure/jobs/JobPgBoss.js';

export class GarAnonymizedBatchEventsLoggingJob extends JobPgBoss {
  constructor(queryBuilder) {
    super(
      {
        name: 'GarAnonymizedBatchEventsLoggingJob',
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
      },
      queryBuilder,
    );
  }
}
