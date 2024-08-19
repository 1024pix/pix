import { JobPgBoss } from '../../../../../../src/shared/infrastructure/jobs/JobPgBoss.js';
import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { PoleEmploiParticipationStartedJob } from '../../../domain/models/PoleEmploiParticipationStartedJob.js';

class PoleEmploiParticipationStartedJobRepository extends JobPgBoss {
  constructor() {
    super(
      {
        name: PoleEmploiParticipationStartedJob.name,
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
      },
      DomainTransaction.getConnection(),
    );
  }
}

export const poleEmploiParticipationStartedJobRepository = new PoleEmploiParticipationStartedJobRepository();
