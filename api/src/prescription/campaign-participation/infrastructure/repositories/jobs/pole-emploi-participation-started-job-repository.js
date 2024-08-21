import { JobRepository } from '../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { PoleEmploiParticipationStartedJob } from '../../../domain/models/PoleEmploiParticipationStartedJob.js';

class PoleEmploiParticipationStartedJobRepository extends JobRepository {
  constructor() {
    super(
      {
        name: PoleEmploiParticipationStartedJob.name,
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
      },
      DomainTransaction.getConnection(),
    );
  }
}

export const poleEmploiParticipationStartedJobRepository = new PoleEmploiParticipationStartedJobRepository();
