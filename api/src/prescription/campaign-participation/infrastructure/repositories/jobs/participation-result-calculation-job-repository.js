import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationResultCalculationJob } from '../../../domain/models/jobs/ParticipationResultCalculationJob.js';

class ParticipationResultCalculationJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationResultCalculationJob.name,
      retryLimit: 10,
      retryDelay: 30,
      retryBackoff: true,
    });
  }
}

export const participationResultCalculationJobRepository = new ParticipationResultCalculationJobRepository();
