import { JobRetry } from '../../../infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../infrastructure/repositories/jobs/job-repository.js';

class ExperimentJobRepository extends JobRepository {
  constructor() {
    super({
      name: 'ExperimentJob',
      retry: JobRetry.STANDARD_RETRY,
    });
  }
}

export const experimentJobRepository = new ExperimentJobRepository();
