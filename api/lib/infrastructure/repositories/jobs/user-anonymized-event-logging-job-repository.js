import { UserAnonymizedEventLoggingJob } from '../../../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { JobRepository, JobRetry } from '../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

class UserAnonymizedEventLoggingJobRepository extends JobRepository {
  constructor() {
    super({
      name: UserAnonymizedEventLoggingJob.name,
      retry: JobRetry.STANDARD_RETRY,
    });
  }
}

export const userAnonymizedEventLoggingJobRepository = new UserAnonymizedEventLoggingJobRepository();
