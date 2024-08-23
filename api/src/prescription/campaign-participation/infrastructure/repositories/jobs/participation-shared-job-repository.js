import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationSharedJob } from '../../../domain/models/ParticipationSharedJob.js';

class ParticipationSharedJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationSharedJob.name,
      retry: JobRetry.NO_RETRY,
    });
  }
}

export const participationSharedJobRepository = new ParticipationSharedJobRepository();
