import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ValidateOrganizationImportFileJob } from '../../../domain/models/ValidateOrganizationImportFileJob.js';

class ValidateOrganizationImportFileJobRepository extends JobRepository {
  constructor() {
    super({
      name: ValidateOrganizationImportFileJob.name,
      expireIn: '00:30:00',
      retryLimit: 0,
      retryDelay: 0,
      retryBackoff: false,
    });
  }
}

export const validateOrganizationImportFileJobRepository = new ValidateOrganizationImportFileJobRepository();
