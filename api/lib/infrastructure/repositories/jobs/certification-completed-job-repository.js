import { JobPgBoss } from '../../../../src/shared/infrastructure/jobs/JobPgBoss.js';
import { JobPriority } from '../../../../src/shared/infrastructure/jobs/JobPriority.js';
import { CertificationCompletedJob } from '../../../domain/events/CertificationCompleted.js';
class CertificationCompletedJobRepository extends JobPgBoss {
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
