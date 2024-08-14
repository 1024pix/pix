import { JobPgBoss } from '../../../../src/shared/infrastructure/jobs/JobPgBoss.js';
import { JobPriority } from '../../../../src/shared/infrastructure/jobs/JobPriority.js';
import { CertificationCompletedJob } from '../../../domain/events/CertificationCompleted.js';
import { DomainTransaction } from '../../DomainTransaction.js';

class CertificationCompletedJobRepository extends JobPgBoss {
  constructor() {
    super(
      {
        name: CertificationCompletedJob.name,
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
        priority: JobPriority.HIGH,
      },
      DomainTransaction.getConnection(),
    );
  }

  /**
   * @param {CertificationCompletedJob} data
   */
  async performAsync(data) {
    return super.performAsync(data);
  }
}

export const certificationCompletedJobRepository = new CertificationCompletedJobRepository();
