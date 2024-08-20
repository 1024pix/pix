import { PoleEmploiParticipationCompletedJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/PoleEmploiParticipationCompletedJob.js';
import { poleEmploiParticipationCompletedJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/pole-emploi-participation-completed-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Repository | Jobs | PoleEmploiParticipationCompletedJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const data = new PoleEmploiParticipationCompletedJob({ campaignParticipationId: 123 });

      // when
      await poleEmploiParticipationCompletedJobRepository.performAsync(data);

      // then
      await expect(PoleEmploiParticipationCompletedJob.name).to.have.been.performed.withJob({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: true,
        data,
      });
    });
  });
});
