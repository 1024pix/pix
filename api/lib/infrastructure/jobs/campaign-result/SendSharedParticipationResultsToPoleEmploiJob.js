import { JobPgBoss } from '../JobPgBoss.js';

class SendSharedParticipationResultsToPoleEmploiJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'SendSharedParticipationResultsToPoleEmploi', retryLimit: 0 }, queryBuilder);
  }
}

SendSharedParticipationResultsToPoleEmploiJob.name = 'SendSharedParticipationResultsToPoleEmploi';

export { SendSharedParticipationResultsToPoleEmploiJob as SendSharedParticipationResultsToPoleEmploiJob };
