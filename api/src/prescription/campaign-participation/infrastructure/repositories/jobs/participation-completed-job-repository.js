import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationCompletedJob } from '../../../domain/models/ParticipationCompletedJob.js';

class ParticipationCompletedJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationCompletedJob.name,
      retry: JobRetry.STANDARD_RETRY,
    });
  }
}

export const participationCompletedJobRepository = new ParticipationCompletedJobRepository();
