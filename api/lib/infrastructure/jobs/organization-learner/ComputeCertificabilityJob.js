import { JobPgBoss } from '../JobPgBoss.js';

class ComputeCertificabilityJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'ComputeCertificabilityJob', retryLimit: 0 }, queryBuilder);
  }
}

export { ComputeCertificabilityJob };
