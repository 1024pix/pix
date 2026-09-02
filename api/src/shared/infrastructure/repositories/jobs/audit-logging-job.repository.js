import { AuditLoggingJob } from '../../../domain/models/jobs/AuditLoggingJob.js';
import { featureToggles } from '../../feature-toggles/index.js';
import { JobRetry } from '../../jobs/default-config.js';
import { JobRepository } from './job-repository.js';

class AuditLoggingJobRepository extends JobRepository {
  constructor() {
    super({
      name: AuditLoggingJob.name,
      retry: JobRetry.STANDARD_RETRY,
    });
  }

  async performAsync(data) {
    if (await featureToggles.get('isAuditLoggingEnabled')) {
      await super.performAsync(data);
    }
  }
}

export const auditLoggingJobRepository = new AuditLoggingJobRepository();
