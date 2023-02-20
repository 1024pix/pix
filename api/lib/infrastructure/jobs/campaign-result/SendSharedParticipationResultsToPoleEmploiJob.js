import Job from '../JobPgBoss';

class SendSharedParticipationResultsToPoleEmploi extends Job {
  constructor(queryBuilder) {
    super({ name: 'SendSharedParticipationResultsToPoleEmploi', retryLimit: 0 }, queryBuilder);
  }
}

SendSharedParticipationResultsToPoleEmploi.name = 'SendSharedParticipationResultsToPoleEmploi';

export default SendSharedParticipationResultsToPoleEmploi;
