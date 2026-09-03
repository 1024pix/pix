import { JobRetry } from '../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { CreateLearningContentReleaseJob } from '../../../domain/models/CreateLearningReleaseJob.js';

class CreateLearningContentReleaseJobRepository extends JobRepository {
  constructor() {
    super({
      name: CreateLearningContentReleaseJob.name,
      retry: JobRetry.NO_RETRY,
    });
  }
}

export const createLearningContentReleaseJobRepository = new CreateLearningContentReleaseJobRepository();
