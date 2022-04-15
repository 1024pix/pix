const Job = require('../JobPgBoss');

class ParticipationResultCalculationJob extends Job {
  constructor(queryBuilder) {
    super({ name: 'ParticipationResultCalculationJob', retryLimit: 3 }, queryBuilder);
  }
}

ParticipationResultCalculationJob.name = 'ParticipationResultCalculationJob';

module.exports = ParticipationResultCalculationJob;
