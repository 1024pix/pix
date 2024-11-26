import { JobRepository, JobRetry } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { LcmsRefreshCacheJob } from '../../../domain/models/LcmsRefreshCacheJob.js';

class LcmsRefreshCacheJobRepository extends JobRepository {
  constructor() {
    super({
      name: LcmsRefreshCacheJob.name,
      retry: JobRetry.NO_RETRY,
    });
  }
}

export const lcmsRefreshCacheJobRepository = new LcmsRefreshCacheJobRepository();
