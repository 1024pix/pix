import {
  JobExpireIn,
  JobRepository,
  JobRetry,
} from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ValidateOrganizationImportFileJob } from '../../../domain/models/ValidateOrganizationImportFileJob.js';

class ValidateOrganizationImportFileJobRepository extends JobRepository {
  constructor() {
    super({
      name: ValidateOrganizationImportFileJob.name,
      expireIn: JobExpireIn.HIGH,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const validateOrganizationImportFileJobRepository = new ValidateOrganizationImportFileJobRepository();
