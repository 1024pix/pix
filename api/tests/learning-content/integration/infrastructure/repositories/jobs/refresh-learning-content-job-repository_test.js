import { RefreshLearningContentJob } from '../../../../../../src/learning-content/domain/models/RefreshLearningContentJob.js';
import { refreshLearningContentJobRepository } from '../../../../../../src/learning-content/infrastructure/repositories/jobs/refresh-learning-content-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../../../test-helper.js';

describe('Learning Content | Integration | Repository | Jobs | RefreshLearningContentJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await refreshLearningContentJobRepository.performAsync({ userId: 123 });

      // then
      await expect(RefreshLearningContentJob.name).to.have.been.performed.withJob({
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
        data: { userId: 123, correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
