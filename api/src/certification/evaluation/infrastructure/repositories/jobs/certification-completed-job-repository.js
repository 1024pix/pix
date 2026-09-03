import { JobPriority, JobRetry } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { CertificationCompletedJob } from '../../../domain/events/CertificationCompleted.js';
class CertificationCompletedJobRepository extends JobRepository {
  constructor() {
    super({
      name: CertificationCompletedJob.name,
      retry: JobRetry.FEW_RETRY,
      priority: JobPriority.HIGH,
    });
  }
}

export const certificationCompletedJobRepository = new CertificationCompletedJobRepository();
