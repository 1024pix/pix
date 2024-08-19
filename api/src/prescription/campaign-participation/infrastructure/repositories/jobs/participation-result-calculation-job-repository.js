import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { JobPgBoss } from '../../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { ParticipationResultCalculationJob } from '../../../domain/models/ParticipationResultCalculationJob.js';

class ParticipationResultCalculationJobRepository extends JobPgBoss {
  constructor() {
    super(
      {
        name: ParticipationResultCalculationJob.name,
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
      },
      DomainTransaction.getConnection(),
    );
  }
}

export const participationResultCalculationJobRepository = new ParticipationResultCalculationJobRepository();
