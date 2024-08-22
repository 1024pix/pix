import { LcmsRefreshCacheJob } from '../../../domain/models/LcmsRefreshCacheJob.js';
import { JobRepository, JobRetry } from './job-repository.js';

class LcmsRefreshCacheJobRepository extends JobRepository {
  constructor() {
    super({
      name: LcmsRefreshCacheJob.name,
      retry: JobRetry.NO_RETRY,
    });
  }
}

export const lcmsRefreshCacheJobRepository = new LcmsRefreshCacheJobRepository();
