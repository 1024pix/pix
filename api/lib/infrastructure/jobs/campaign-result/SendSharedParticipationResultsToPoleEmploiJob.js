import { JobPgBoss } from '../JobPgBoss.js';

class SendSharedParticipationResultsToPoleEmploi extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'SendSharedParticipationResultsToPoleEmploi', retryLimit: 0 }, queryBuilder);
  }
}

SendSharedParticipationResultsToPoleEmploi.name = 'SendSharedParticipationResultsToPoleEmploi';

export { SendSharedParticipationResultsToPoleEmploi };
