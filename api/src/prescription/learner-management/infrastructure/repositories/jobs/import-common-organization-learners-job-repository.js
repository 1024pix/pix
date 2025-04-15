import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ImportCommonOrganizationLearnersJob } from '../../../domain/models/ImportCommonOrganizationLearnersJob.js';

class ImportCommonOrganizationLearnersJobRepository extends JobRepository {
  constructor() {
    super({
      name: ImportCommonOrganizationLearnersJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const importCommonOrganizationLearnersJobRepository = new ImportCommonOrganizationLearnersJobRepository();
