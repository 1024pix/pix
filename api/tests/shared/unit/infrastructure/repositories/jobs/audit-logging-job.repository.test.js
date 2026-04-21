import { AuditLoggingJob } from '../../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { auditLoggingJobRepository } from '../../../../../../src/shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import { JobRetry } from '../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

describe('Unit | Shared | Infrastructure | Jobs | AuditLoggingJobRepository', function () {
  it('sets up the job repository configuration', async function () {
    expect(auditLoggingJobRepository.name).to.equal(AuditLoggingJob.name);
    expect(auditLoggingJobRepository.retry).to.equal(JobRetry.STANDARD_RETRY);
  });
});
