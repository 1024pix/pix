import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { JobPgBoss } from '../../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { PoleEmploiParticipationCompletedJob } from '../../../domain/models/PoleEmploiParticipationCompletedJob.js';

class PoleEmploiParticipationCompletedJobRepository extends JobPgBoss {
  constructor() {
    super(
      {
        name: PoleEmploiParticipationCompletedJob.name,
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
      },
      DomainTransaction.getConnection(),
    );
  }
}

export const poleEmploiParticipationCompletedJobRepository = new PoleEmploiParticipationCompletedJobRepository();
