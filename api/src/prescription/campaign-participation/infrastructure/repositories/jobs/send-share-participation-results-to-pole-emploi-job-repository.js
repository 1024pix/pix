import { JobPgBoss } from '../../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { SendSharedParticipationResultsToPoleEmploiJob } from '../../../domain/models/SendSharedParticipationResultsToPoleEmploiJob.js';

class SendSharedParticipationResultsToPoleEmploiJobRepository extends JobPgBoss {
  constructor() {
    super({
      name: SendSharedParticipationResultsToPoleEmploiJob.name,
      retryLimit: 0,
      retryDelay: 0,
      retryBackoff: false,
    });
  }
}

export const sendSharedParticipationResultsToPoleEmploiJobRepository =
  new SendSharedParticipationResultsToPoleEmploiJobRepository();
