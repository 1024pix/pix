import { JobPgBoss } from '../JobPgBoss.js';

export class UserAnonymizedEventLoggingJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'UserAnonymizedEventLoggingJob' }, queryBuilder);
  }
}
