const Job = require('../JobPgBoss');

class ParticipationResultCalculationJob extends Job {
  constructor(queryBuilder) {
    super({ name: 'ParticipationResultCalculationJob', retryLimit: 3 }, queryBuilder);
  }
}

module.exports = ParticipationResultCalculationJob;
