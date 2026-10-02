import { JobRepository } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { PublishSessionJob } from '../../domain/models/PublishSessionJob.js';

class PublishSessionJobRepository extends JobRepository {
  constructor() {
    super({
      name: PublishSessionJob.name,
    });
  }
}

export const publishSessionJobRepository = new PublishSessionJobRepository();
