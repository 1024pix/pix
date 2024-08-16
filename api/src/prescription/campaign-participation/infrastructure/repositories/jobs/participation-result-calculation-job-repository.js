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
      }
    );
  }
}

export const participationResultCalculationJobRepository = new ParticipationResultCalculationJobRepository();
