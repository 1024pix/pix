import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ScoreCertificationJob } from '../../../domain/models/ScoreCertificationJob.js';

class ScoreCertificationJobRepository extends JobRepository {
  constructor() {
    super({ name: ScoreCertificationJob.name });
  }
}

export const scoreCertificationJobRepository = new ScoreCertificationJobRepository();
