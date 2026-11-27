import { JobPriority, JobRetry } from '../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ScoreDiagJob } from '../../../domain/events/ScoreDiag.js';
class ScoreDiagJobRepository extends JobRepository {
  constructor() {
    super({
      name: ScoreDiagJob.name,
      retry: JobRetry.FEW_RETRY,
      priority: JobPriority.HIGH,
    });
  }
}

export const scoreDiagJobRepository = new ScoreDiagJobRepository();
