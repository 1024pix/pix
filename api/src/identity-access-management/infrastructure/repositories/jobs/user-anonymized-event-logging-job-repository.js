import { JobRepository, JobRetry } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { UserAnonymizedEventLoggingJob } from '../../../domain/models/UserAnonymizedEventLoggingJob.js';

class UserAnonymizedEventLoggingJobRepository extends JobRepository {
  constructor() {
    super({
      name: UserAnonymizedEventLoggingJob.name,
      retry: JobRetry.STANDARD_RETRY,
    });
  }
}

export const userAnonymizedEventLoggingJobRepository = new UserAnonymizedEventLoggingJobRepository();
