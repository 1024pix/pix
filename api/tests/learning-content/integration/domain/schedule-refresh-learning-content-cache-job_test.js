import { LcmsRefreshCacheJob } from '../../../../src/learning-content/domain/models/LcmsRefreshCacheJob.js';
import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';
import { expect } from '../../../test-helper.js';

describe('Learning Content | Integration | Domain | Use case | scheduleRefreshLearningContentCacheJob', function () {
  it('should schedule the job', async function () {
    await usecases.scheduleRefreshLearningContentCacheJob({ userId: 123 });

    await expect(LcmsRefreshCacheJob.name).to.have.been.performed.withJobPayload({
      userId: 123,
      correlationContext: {
        user_id: '-',
      },
    });
  });
});
