import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ValidateOrganizationImportFileJob } from '../../../domain/models/ValidateOrganizationImportFileJob.js';

class ValidateOrganizationImportFileJobRepository extends JobRepository {
  constructor() {
    super({
      name: ValidateOrganizationImportFileJob.name,
      expireIn: '00:30:00',
      retry: JobRetry.NO_RETRY,
    });
  }
}

export const validateOrganizationImportFileJobRepository = new ValidateOrganizationImportFileJobRepository();
