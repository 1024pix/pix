import { ParticipationStartedJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/ParticipationStartedJob.js';
import { participationStartedJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-started-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';

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
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
        data: {
          campaignParticipationId: 777,
          correlationContext: EMPTY_CORRELATION_INFO,
        },
      });
    });
  });
});
