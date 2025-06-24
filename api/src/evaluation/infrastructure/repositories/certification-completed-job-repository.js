import { CertificationCompletedJob } from '../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import {
  JobPriority,
  JobRepository,
  JobRetry,
} from '../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
class CertificationCompletedJobRepository extends JobRepository {
  constructor() {
    super({
      name: CertificationCompletedJob.name,
      retry: JobRetry.STANDARD_RETRY,
      priority: JobPriority.HIGH,
    });
  }
}

export const certificationCompletedJobRepository = new CertificationCompletedJobRepository();
