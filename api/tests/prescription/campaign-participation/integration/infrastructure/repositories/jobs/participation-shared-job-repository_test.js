import { ParticipationSharedJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/ParticipationSharedJob.js';
import { participationSharedJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-shared-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | participationSharedJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await participationSharedJobRepository.performAsync({ campaignParticipationId: 2 });

      // then

      await expect(ParticipationSharedJob.name).to.have.been.performed.withJob({
        name: ParticipationSharedJob.name,
        retrylimit: 0,
        retrydelay: 0,
        retrybackoff: false,
        data: { campaignParticipationId: 2 },
      });
    });
  });
});
