import { JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ValidateSiecleFileJob } from '../../../domain/models/jobs/ValidateSiecleFileJob.js';

class ValidateSiecleFileJobRepository extends JobRepository {
  constructor() {
    super({
      name: ValidateSiecleFileJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const validateSiecleFileJobRepository = new ValidateSiecleFileJobRepository();
