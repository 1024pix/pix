import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationStartedJob } from '../../../domain/models/ParticipationStartedJob.js';

class ParticipationStartedJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationStartedJob.name,
      retry: JobRetry.NO_RETRY,
    });
  }
}

export const participationStartedJobRepository = new ParticipationStartedJobRepository();
