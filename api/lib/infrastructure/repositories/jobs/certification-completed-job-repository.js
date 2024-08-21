import { JobPriority, JobRepository } from '../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { CertificationCompletedJob } from '../../../domain/events/CertificationCompleted.js';
class CertificationCompletedJobRepository extends JobRepository {
  constructor() {
    super({
      name: CertificationCompletedJob.name,
      retryLimit: 10,
      retryDelay: 30,
      retryBackoff: true,
      priority: JobPriority.HIGH,
    });
  }
}

export const certificationCompletedJobRepository = new CertificationCompletedJobRepository();
