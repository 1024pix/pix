import { EventLoggingJob } from '../../../../../../src/identity-access-management/domain/models/jobs/EventLoggingJob.js';
import { eventLoggingJobRepository } from '../../../../../../src/identity-access-management/infrastructure/repositories/jobs/event-logging-job.repository.js';
import { JobRetry } from '../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Jobs | EventLoggingJobRepository', function () {
  it('sets up the job repository configuration', async function () {
    expect(eventLoggingJobRepository.name).to.equal(EventLoggingJob.name);
    expect(eventLoggingJobRepository.retry).to.equal(JobRetry.STANDARD_RETRY);
  });
});
