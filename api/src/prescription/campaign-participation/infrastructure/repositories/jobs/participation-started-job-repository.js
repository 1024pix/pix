import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationStartedJob } from '../../../domain/models/ParticipationStartedJob.js';

class ParticipationStartedJobRepository extends JobRepository {
  constructor() {
    super(
      {
        name: ParticipationStartedJob.name,
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
      },
      DomainTransaction.getConnection(),
    );
  }
}

export const participationStartedJobRepository = new ParticipationStartedJobRepository();
