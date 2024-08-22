import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationResultCalculationJob } from '../../../domain/models/ParticipationResultCalculationJob.js';

class ParticipationResultCalculationJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationResultCalculationJob.name,
      retry: JobRetry.STANDARD_RETRY,
    });
  }
}

export const participationResultCalculationJobRepository = new ParticipationResultCalculationJobRepository();
