import { LcmsRefreshCacheJob } from '../../../../../../src/learning-content/domain/models/LcmsRefreshCacheJob.js';
import { lcmsRefreshCacheJobRepository } from '../../../../../../src/learning-content/infrastructure/repositories/jobs/lcms-refresh-cache-job-repository.js';
import { expect } from '../../../../../test-helper.js';

describe('Integration | Repository | Jobs | LcmsRefreshCacheJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await lcmsRefreshCacheJobRepository.performAsync({ userId: 123 });

      // then
      await expect(LcmsRefreshCacheJob.name).to.have.been.performed.withJob({
        retrylimit: 0,
        retrydelay: 0,
        retrybackoff: false,
        data: { userId: 123 },
      });
    });
  });
});
