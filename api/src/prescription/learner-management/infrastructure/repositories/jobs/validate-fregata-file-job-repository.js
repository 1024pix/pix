import { JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ValidateFregataFileJob } from '../../../domain/models/jobs/ValidateFregataFileJob.js';

class ValidateFregataFileJobRepository extends JobRepository {
  constructor() {
    super({
      name: ValidateFregataFileJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const validateFregataFileJobRepository = new ValidateFregataFileJobRepository();
