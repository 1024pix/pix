import { JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ImportFromSupJob } from '../../../domain/models/jobs/ImportFromSupJob.js';

class ImportFromSupJobRepository extends JobRepository {
  constructor() {
    super({
      name: ImportFromSupJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const importFromSupJobRepository = new ImportFromSupJobRepository();
