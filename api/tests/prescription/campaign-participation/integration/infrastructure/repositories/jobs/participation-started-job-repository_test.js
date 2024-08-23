import { ParticipationStartedJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/ParticipationStartedJob.js';
import { participationStartedJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-started-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | participationStartedJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      const participationStartedJob = new ParticipationStartedJob({
        campaignParticipationId: 777,
      });

      await participationStartedJobRepository.performAsync(participationStartedJob);

      // then
      await expect(ParticipationStartedJob.name).to.have.been.performed.withJob({
        retrylimit: 0,
        retrydelay: 0,
        retrybackoff: false,
        data: {
          campaignParticipationId: 777,
        },
      });
    });
  });
});
