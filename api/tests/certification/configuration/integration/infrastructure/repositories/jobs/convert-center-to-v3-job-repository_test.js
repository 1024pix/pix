import { ConvertScoCenterToV3Job } from '../../../../../../../src/certification/configuration/domain/models/ConvertScoCenterToV3Job.js';
import { convertScoCenterToV3JobRepository } from '../../../../../../../src/certification/configuration/infrastructure/repositories/jobs/convert-sco-center-to-v3-job-repository.js';
import { JobPriority } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Repository | Jobs | ConvertScoCenterToV3JobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const data = new ConvertScoCenterToV3Job({
        centerId: 1,
      });

      // when
      await convertScoCenterToV3JobRepository.performAsync(data);

      // then
      await expect(ConvertScoCenterToV3Job.name).to.have.been.performed.withJob({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: false,
        priority: JobPriority.DEFAULT,
        data,
      });
    });
  });
});
