import { JobExpireIn, JobRepository, JobRetry } from '../../../../infrastructure/repositories/jobs/job-repository.js';

class SendEmailJobRepository extends JobRepository {
  constructor() {
    super({
      name: 'SendEmailJob',
      retry: JobRetry.STANDARD_RETRY,
      expireIn: JobExpireIn.HIGH,
    });
  }
}

export const sendEmailJobRepository = new SendEmailJobRepository();
