import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ImportOrganizationLearnersJob } from '../../../domain/models/ImportOrganizationLearnersJob.js';

class ImportOrganizationLearnersJobRepository extends JobRepository {
  constructor() {
    super({
      name: ImportOrganizationLearnersJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const importOrganizationLearnersJobRepository = new ImportOrganizationLearnersJobRepository();
