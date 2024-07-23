import { JobPgBoss } from '../JobPgBoss.js';

class ParticipationResultCalculationJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'ParticipationResultCalculationJob', retryLimit: 3 }, queryBuilder);
  }
}

export { ParticipationResultCalculationJob };
