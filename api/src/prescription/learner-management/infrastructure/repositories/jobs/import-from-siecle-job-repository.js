import { JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ImportFromSiecleJob } from '../../../domain/models/jobs/ImportFromSiecleJob.js';

class ImportFromSiecleJobRepository extends JobRepository {
  constructor() {
    super({
      name: ImportFromSiecleJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const importFromSiecleJobRepository = new ImportFromSiecleJobRepository();
