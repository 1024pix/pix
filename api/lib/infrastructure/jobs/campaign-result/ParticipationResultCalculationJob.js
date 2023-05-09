import { Job } from '../JobPgBoss.js';

class ParticipationResultCalculationJob extends Job {
  constructor(queryBuilder) {
    super({ name: 'ParticipationResultCalculationJob', retryLimit: 3 }, queryBuilder);
  }
}

ParticipationResultCalculationJob.name = 'ParticipationResultCalculationJob';

export { ParticipationResultCalculationJob };
