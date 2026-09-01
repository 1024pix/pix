import { JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationResultCalculationJob } from '../../../domain/models/ParticipationResultCalculationJob.js';

class ParticipationResultCalculationJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationResultCalculationJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const participationResultCalculationJobRepository = new ParticipationResultCalculationJobRepository();
