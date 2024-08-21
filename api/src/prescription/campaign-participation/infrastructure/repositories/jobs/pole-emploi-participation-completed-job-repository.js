import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { PoleEmploiParticipationCompletedJob } from '../../../domain/models/PoleEmploiParticipationCompletedJob.js';

class PoleEmploiParticipationCompletedJobRepository extends JobRepository {
  constructor() {
    super({
      name: PoleEmploiParticipationCompletedJob.name,
      retryLimit: 10,
      retryDelay: 30,
      retryBackoff: true,
    });
  }
}

export const poleEmploiParticipationCompletedJobRepository = new PoleEmploiParticipationCompletedJobRepository();
