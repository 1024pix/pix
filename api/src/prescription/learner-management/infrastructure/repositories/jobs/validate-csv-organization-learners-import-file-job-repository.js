import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ValidateCsvOrganizationImportFileJob } from '../../../domain/models/ValidateCsvOrganizationImportFileJob.js';

class ValidateCsvOrganizationImportFileJobRepository extends JobRepository {
  constructor() {
    super({
      name: ValidateCsvOrganizationImportFileJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const validateCsvOrganizationImportFileJobRepository = new ValidateCsvOrganizationImportFileJobRepository();
