import { CreateLearningContentReleaseJob } from '../../../../../../src/learning-content/domain/models/CreateLearningReleaseJob.js';
import { createLearningContentReleaseJobRepository } from '../../../../../../src/learning-content/infrastructure/repositories/jobs/create-learning-content-release-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../../../test-helper.js';

describe('Learning Content | Integration | Repository | Jobs | CreateLearningContentReleaseJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await createLearningContentReleaseJobRepository.performAsync({ userId: 123 });

      // then
      await expect(CreateLearningContentReleaseJob.name).to.have.been.performed.withJob({
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
        data: { userId: 123, correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
