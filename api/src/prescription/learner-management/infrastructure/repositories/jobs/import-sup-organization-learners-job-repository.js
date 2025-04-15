import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ImportSupOrganizationLearnersJob } from '../../../domain/models/ImportSupOrganizationLearnersJob.js';

class ImportSupOrganizationLearnersJobRepository extends JobRepository {
  constructor() {
    super({
      name: ImportSupOrganizationLearnersJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const importSupOrganizationLearnersJobRepository = new ImportSupOrganizationLearnersJobRepository();
