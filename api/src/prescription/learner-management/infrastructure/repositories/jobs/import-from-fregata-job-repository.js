import { JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ImportFromFregataJob } from '../../../domain/models/jobs/ImportFromFregataJob.js';

class ImportFromFregataJobRepository extends JobRepository {
  constructor() {
    super({
      name: ImportFromFregataJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const importFromFregataJobRepository = new ImportFromFregataJobRepository();
