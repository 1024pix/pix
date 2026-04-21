import { LcmsCreateReleaseJob } from '../../../../src/learning-content/domain/models/LcmsCreateReleaseJob.js';
import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';
import { EMPTY_CORRELATION_INFO } from '../../../../src/shared/infrastructure/execution-context-manager.js';

describe('Learning Content | Integration | Domain | Use case | scheduleCreateLearningContentReleaseJob', function () {
  it('should schedule the job', async function () {
    await usecases.scheduleCreateLearningContentReleaseJob({ userId: 123 });

    await expect(LcmsCreateReleaseJob.name).to.have.been.performed.withJobPayload({
      userId: 123,
      correlationContext: EMPTY_CORRELATION_INFO,
    });
  });
});
