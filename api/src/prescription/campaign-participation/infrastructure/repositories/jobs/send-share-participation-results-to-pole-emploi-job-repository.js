import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { SendSharedParticipationResultsToPoleEmploiJob } from '../../../domain/models/SendSharedParticipationResultsToPoleEmploiJob.js';

class SendSharedParticipationResultsToPoleEmploiJobRepository extends JobRepository {
  constructor() {
    super({
      name: SendSharedParticipationResultsToPoleEmploiJob.name,
      retryLimit: 0,
      retryDelay: 0,
      retryBackoff: false,
    });
  }
}

export const sendSharedParticipationResultsToPoleEmploiJobRepository =
  new SendSharedParticipationResultsToPoleEmploiJobRepository();
