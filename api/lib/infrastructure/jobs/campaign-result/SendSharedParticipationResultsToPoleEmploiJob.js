const Job = require('../JobPgBoss.js');

class SendSharedParticipationResultsToPoleEmploi extends Job {
  constructor(queryBuilder) {
    super({ name: 'SendSharedParticipationResultsToPoleEmploi', retryLimit: 0 }, queryBuilder);
  }
}

SendSharedParticipationResultsToPoleEmploi.name = 'SendSharedParticipationResultsToPoleEmploi';

module.exports = SendSharedParticipationResultsToPoleEmploi;
