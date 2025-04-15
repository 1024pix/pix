import { JobRepository, JobRetry } from '../../../../infrastructure/repositories/jobs/job-repository.js';

class SendEmailJobRepository extends JobRepository {
  constructor() {
    super({
      name: 'SendEmailJob',
      retry: JobRetry.STANDARD_RETRY,
    });
  }
}

export const sendEmailJobRepository = new SendEmailJobRepository();
