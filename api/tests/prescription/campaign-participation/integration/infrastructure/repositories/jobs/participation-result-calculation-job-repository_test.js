import { ParticipationResultCalculationJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/ParticipationResultCalculationJob.js';
import { participationResultCalculationJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-result-calculation-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | participationResultCalculationJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await participationResultCalculationJobRepository.performAsync({ campaignParticipationId: 3 });

      // then
      await expect(ParticipationResultCalculationJob.name).to.have.been.performed.withJob({
        name: ParticipationResultCalculationJob.name,
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: true,
        data: { campaignParticipationId: 3 },
      });
    });
  });
});
