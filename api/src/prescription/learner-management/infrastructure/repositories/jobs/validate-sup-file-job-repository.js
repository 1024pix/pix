import { JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ValidateSupFileJob } from '../../../domain/models/jobs/ValidateSupFileJob.js';

class ValidateSupFileJobRepository extends JobRepository {
  constructor() {
    super({
      name: ValidateSupFileJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const validateSupFileJobRepository = new ValidateSupFileJobRepository();
