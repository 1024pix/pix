import {
  JobPriority,
  JobRepository,
  JobRetry,
} from '../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { CertificationCompletedJob } from '../../../domain/events/CertificationCompleted.js';
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
