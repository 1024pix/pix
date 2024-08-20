import { JobPgBoss } from '../../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { PoleEmploiParticipationCompletedJob } from '../../../domain/models/PoleEmploiParticipationCompletedJob.js';

class PoleEmploiParticipationCompletedJobRepository extends JobPgBoss {
  constructor() {
    super({
      name: PoleEmploiParticipationCompletedJob.name,
      retryLimit: 10,
      retryDelay: 30,
      retryBackoff: true,
    });
  }
}

export const poleEmploiParticipationCompletedJobRepository = new PoleEmploiParticipationCompletedJobRepository();
