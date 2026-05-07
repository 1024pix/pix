import { CreateLearningContentReleaseJob } from '../../../../src/learning-content/domain/models/CreateLearningReleaseJob.js';
import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';
import { EMPTY_CORRELATION_INFO } from '../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../test-helper.js';

describe('Learning Content | Integration | Domain | Use case | scheduleCreateLearningContentReleaseJob', function () {
  it('should schedule the job', async function () {
    await usecases.scheduleCreateLearningContentReleaseJob({ userId: 123 });

    await expect(CreateLearningContentReleaseJob.name).to.have.been.performed.withJobPayload({
      userId: 123,
      correlationContext: EMPTY_CORRELATION_INFO,
    });
  });
});
