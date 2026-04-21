import { ParticipationResultCalculationJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/ParticipationResultCalculationJob.js';
import { participationResultCalculationJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-result-calculation-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | participationResultCalculationJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await participationResultCalculationJobRepository.performAsync({ campaignParticipationId: 3 });

      // then
      await expect(ParticipationResultCalculationJob.name).to.have.been.performed.withJob({
        name: ParticipationResultCalculationJob.name,
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { campaignParticipationId: 3, correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
