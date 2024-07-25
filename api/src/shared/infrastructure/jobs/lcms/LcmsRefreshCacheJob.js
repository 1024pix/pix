import { JobPgBoss } from '../JobPgBoss.js';

class LcmsRefreshCacheJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'LcmsRefreshCacheJob', retryLimit: 0 }, queryBuilder);
  }
}

export { LcmsRefreshCacheJob };
