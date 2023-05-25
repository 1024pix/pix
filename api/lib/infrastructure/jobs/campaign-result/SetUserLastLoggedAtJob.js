import { JobPgBoss } from '../JobPgBoss.js';

class SetUserLastLoggedAtJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'SetUserLastLoggedAtJob', retryLimit: 0 }, queryBuilder);
  }
}

export { SetUserLastLoggedAtJob };
