import { JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ValidateGenericFileJob } from '../../../domain/models/jobs/ValidateGenericFileJob.js';

class ValidateGenericFileJobRepository extends JobRepository {
  constructor() {
    super({
      name: ValidateGenericFileJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const validateGenericFileJobRepository = new ValidateGenericFileJobRepository();
