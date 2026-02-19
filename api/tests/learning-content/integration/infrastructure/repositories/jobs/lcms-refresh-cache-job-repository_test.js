import { LcmsRefreshCacheJob } from '../../../../../../src/learning-content/domain/models/LcmsRefreshCacheJob.js';
import { lcmsRefreshCacheJobRepository } from '../../../../../../src/learning-content/infrastructure/repositories/jobs/lcms-refresh-cache-job-repository.js';
import { expect } from '../../../../../test-helper.js';

describe('Learning Content | Integration | Repository | Jobs | LcmsRefreshCacheJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await lcmsRefreshCacheJobRepository.performAsync({ userId: 123 });

      // then
      await expect(LcmsRefreshCacheJob.name).to.have.been.performed.withJob({
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
        data: { userId: 123 },
      });
    });
  });
});
