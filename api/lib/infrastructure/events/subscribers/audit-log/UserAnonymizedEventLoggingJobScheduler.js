import { UserAnonymized } from '../../../../domain/events/UserAnonymized.js';
import { PgBossJobScheduler } from '../../../jobs/PgBossJobScheduler.js';

export class UserAnonymizedEventLoggingJobScheduler extends PgBossJobScheduler {
  constructor(domainTransaction) {
    super({ jobName: UserAnonymizedEventLoggingJobScheduler.jobName }, domainTransaction.knexTransaction);
  }

  static event = UserAnonymized;
  static jobName = 'UserAnonymizedEventLoggingJob';

  get name() {
    return this.constructor.name;
  }
}
