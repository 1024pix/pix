import { RefreshLearningContentJob } from '../../../../src/learning-content/domain/models/RefreshLearningContentJob.js';
import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';
import { EMPTY_CORRELATION_INFO } from '../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../test-helper.js';

describe('Learning Content | Integration | Domain | Use case | scheduleRefreshLearningContentCacheJob', function () {
  it('should schedule the job', async function () {
    await usecases.scheduleRefreshLearningContentJob({ userId: 123 });

    await expect(RefreshLearningContentJob.name).to.have.been.performed.withJobPayload({
      userId: 123,
      correlationContext: EMPTY_CORRELATION_INFO,
    });
  });
});
