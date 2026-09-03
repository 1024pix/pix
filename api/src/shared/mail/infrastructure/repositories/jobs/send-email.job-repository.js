import { JobRetry } from '../../../../infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../infrastructure/repositories/jobs/job-repository.js';

class SendEmailJobRepository extends JobRepository {
  constructor() {
    super({
      name: 'SendEmailJob',
      retry: JobRetry.STANDARD_RETRY,
    });
  }
}

export const sendEmailJobRepository = new SendEmailJobRepository();
