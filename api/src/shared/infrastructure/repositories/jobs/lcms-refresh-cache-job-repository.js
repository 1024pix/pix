import { LcmsRefreshCacheJob } from '../../../domain/models/jobs/LcmsRefreshCacheJob.js';
import { JobRepository } from './job-repository.js';

class LcmsRefreshCacheJobRepository extends JobRepository {
  constructor() {
    super({
      name: LcmsRefreshCacheJob.name,
      retryLimit: 0,
      retryDelay: 0,
      retryBackoff: false,
    });
  }
}

export const lcmsRefreshCacheJobRepository = new LcmsRefreshCacheJobRepository();
