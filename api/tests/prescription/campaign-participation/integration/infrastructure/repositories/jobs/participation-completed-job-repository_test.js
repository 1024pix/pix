import { ParticipationCompletedJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/ParticipationCompletedJob.js';
import { participationCompletedJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-completed-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | participationCompletedJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const data = new ParticipationCompletedJob({ campaignParticipationId: 123 });

      // when
      await participationCompletedJobRepository.performAsync(data);

      // then
      await expect(ParticipationCompletedJob.name).to.have.been.performed.withJob({
        retrylimit: 0,
        retrydelay: 0,
        retrybackoff: false,
        data,
      });
    });
  });
});
