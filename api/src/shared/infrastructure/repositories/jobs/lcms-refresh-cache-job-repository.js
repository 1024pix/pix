import { LcmsRefreshCacheJob } from '../../../domain/models/LcmsRefreshCacheJob.js';
import { JobPgBoss } from '../../jobs/JobPgBoss.js';

class LcmsRefreshCacheJobRepository extends JobPgBoss {
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
