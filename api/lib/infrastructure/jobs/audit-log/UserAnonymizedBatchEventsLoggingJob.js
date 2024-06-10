import { JobPgBoss } from '../JobPgBoss.js';

export class UserAnonymizedBatchEventsLoggingJob extends JobPgBoss {
  constructor(queryBuilder) {
    super(
      {
        name: 'UserAnonymizedBatchEventsLoggingJob',
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
      },
      queryBuilder,
    );
  }
}
