import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationCompletedJob } from '../../../domain/models/ParticipationCompletedJob.js';

class ParticipationCompletedJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationCompletedJob.name,
      retryLimit: 10,
      retryDelay: 30,
      retryBackoff: true,
    });
  }
}

export const participationCompletedJobRepository = new ParticipationCompletedJobRepository();
