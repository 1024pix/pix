import { Job } from '../JobPgBoss.js';

class SendSharedParticipationResultsToPoleEmploi extends Job {
  constructor(queryBuilder) {
    super({ name: 'SendSharedParticipationResultsToPoleEmploi', retryLimit: 0 }, queryBuilder);
  }
}

SendSharedParticipationResultsToPoleEmploi.name = 'SendSharedParticipationResultsToPoleEmploi';

export { SendSharedParticipationResultsToPoleEmploi };
