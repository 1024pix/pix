import { ParticipationResultCalculationJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/ParticipationResultCalculationJob.js';
import { participationResultCalculationJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-result-calculation-job-repository.js';
import { expect } from '../../../../../../test-helper.js';
import { jobs } from '../../../../../../tooling/jobs/expect-job.js';

describe('Integration | Repository | Jobs | ParticipationResultCalculationJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await participationResultCalculationJobRepository.performAsync({ campaignParticipationId: 3 });

      // then
      const results = await jobs(ParticipationResultCalculationJob.name);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.deep.contains({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: true,
        data: { campaignParticipationId: 3 },
      });
    });
  });
});
