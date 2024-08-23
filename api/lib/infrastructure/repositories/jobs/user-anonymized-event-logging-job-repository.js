import { UserAnonymizedEventLoggingJob } from '../../../../src/identity-access-management/domain/models/jobs/UserAnonymizedEventLoggingJob.js';
import { JobRepository } from '../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

class UserAnonymizedEventLoggingJobRepository extends JobRepository {
  constructor() {
    super({
      name: UserAnonymizedEventLoggingJob.name,
      retryLimit: 10,
      retryDelay: 30,
      retryBackoff: true,
    });
  }
}

export const userAnonymizedEventLoggingJobRepository = new UserAnonymizedEventLoggingJobRepository();
