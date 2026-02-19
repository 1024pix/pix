import { LcmsCreateReleaseJob } from '../../../../../../src/learning-content/domain/models/LcmsCreateReleaseJob.js';
import { lcmsCreateReleaseJobRepository } from '../../../../../../src/learning-content/infrastructure/repositories/jobs/lcms-create-release-job-repository.js';
import { expect } from '../../../../../test-helper.js';

describe('Learning Content | Integration | Repository | Jobs | LcmsCreateReleaseJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await lcmsCreateReleaseJobRepository.performAsync({ userId: 123 });

      // then
      await expect(LcmsCreateReleaseJob.name).to.have.been.performed.withJob({
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
        data: { userId: 123 },
      });
    });
  });
});
