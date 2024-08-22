import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationSharedJob } from '../../../domain/models/ParticipationSharedJob.js';

class ParticipationSharedJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationSharedJob.name,
      retryLimit: 0,
      retryDelay: 0,
      retryBackoff: false,
    });
  }
}

export const participationSharedJobRepository = new ParticipationSharedJobRepository();
