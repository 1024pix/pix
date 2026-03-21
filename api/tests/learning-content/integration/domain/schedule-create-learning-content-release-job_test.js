import { LcmsCreateReleaseJob } from '../../../../src/learning-content/domain/models/LcmsCreateReleaseJob.js';
import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';
import { expect } from '../../../test-helper.js';

describe('Learning Content | Integration | Domain | Use case | scheduleCreateLearningContentReleaseJob', function () {
  it('should schedule the job', async function () {
    await usecases.scheduleCreateLearningContentReleaseJob({ userId: 123 });

    await expect(LcmsCreateReleaseJob.name).to.have.been.performed.withJobPayload({
      userId: 123,
      correlationContext: {
        user_id: null,
      },
    });
  });
});
