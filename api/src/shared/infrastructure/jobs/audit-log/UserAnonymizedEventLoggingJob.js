import { JobPgBoss } from '../JobPgBoss.js';

export class UserAnonymizedEventLoggingJob extends JobPgBoss {
  constructor(queryBuilder) {
    super(
      {
        name: 'UserAnonymizedEventLoggingJob',
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
      },
      queryBuilder,
    );
  }
}
