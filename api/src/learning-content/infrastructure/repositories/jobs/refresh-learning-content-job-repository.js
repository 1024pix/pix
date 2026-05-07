import { JobRepository, JobRetry } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { RefreshLearningContentJob } from '../../../domain/models/RefreshLearningContentJob.js';

class RefreshLearningContentJobRepository extends JobRepository {
  constructor() {
    super({
      name: RefreshLearningContentJob.name,
      retry: JobRetry.NO_RETRY,
    });
  }
}

export const refreshLearningContentJobRepository = new RefreshLearningContentJobRepository();
