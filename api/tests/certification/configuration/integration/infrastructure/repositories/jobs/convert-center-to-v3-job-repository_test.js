import { ConvertCenterToV3Job } from '../../../../../../../src/certification/configuration/domain/models/ConvertCenterToV3Job.js';
import { convertCenterToV3JobRepository } from '../../../../../../../src/certification/configuration/infrastructure/repositories/jobs/convert-center-to-v3-job-repository.js';
import { JobPriority } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Repository | Jobs | ConvertCenterToV3JobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const data = new ConvertCenterToV3Job({
        centerId: 1,
      });

      // when
      await convertCenterToV3JobRepository.performAsync(data);

      // then
      await expect(ConvertCenterToV3Job.name).to.have.been.performed.withJob({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: false,
        priority: JobPriority.DEFAULT,
        data,
      });
    });
  });
});
