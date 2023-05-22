import { JobPgBoss } from '../JobPgBoss.js';

class SendSharedParticipationResultsToPoleEmploiJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'SendSharedParticipationResultsToPoleEmploiJob', retryLimit: 0 }, queryBuilder);
  }
}

export { SendSharedParticipationResultsToPoleEmploiJob };
