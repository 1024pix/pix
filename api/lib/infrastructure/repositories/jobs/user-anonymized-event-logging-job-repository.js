import { UserAnonymizedEventLoggingJob } from '../../../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { JobPgBoss } from '../../../../src/shared/infrastructure/jobs/JobPgBoss.js';
import { DomainTransaction } from '../../DomainTransaction.js';

class UserAnonymizedEventLoggingJobRepository extends JobPgBoss {
  constructor() {
    super(
      {
        name: UserAnonymizedEventLoggingJob.name,
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
      },
      DomainTransaction.getConnection(),
    );
  }
}

export const userAnonymizedEventLoggingJobRepository = new UserAnonymizedEventLoggingJobRepository();
