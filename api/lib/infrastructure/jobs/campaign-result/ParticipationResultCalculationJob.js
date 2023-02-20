import Job from '../JobPgBoss';

class ParticipationResultCalculationJob extends Job {
  constructor(queryBuilder) {
    super({ name: 'ParticipationResultCalculationJob', retryLimit: 3 }, queryBuilder);
  }
}

ParticipationResultCalculationJob.name = 'ParticipationResultCalculationJob';

export default ParticipationResultCalculationJob;
