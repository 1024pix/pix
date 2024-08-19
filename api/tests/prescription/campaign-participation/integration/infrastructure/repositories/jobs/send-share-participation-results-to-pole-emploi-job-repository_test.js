import { SendSharedParticipationResultsToPoleEmploiJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/SendSharedParticipationResultsToPoleEmploiJob.js';
import { sendSharedParticipationResultsToPoleEmploiJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/send-share-participation-results-to-pole-emploi-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Repository | Jobs| SendSharedParticipationResultsToPoleEmploiJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await sendSharedParticipationResultsToPoleEmploiJobRepository.performAsync({ campaignParticipationId: 2 });

      // then

      await expect(SendSharedParticipationResultsToPoleEmploiJob.name).to.have.been.performed.withJob({
        name: SendSharedParticipationResultsToPoleEmploiJob.name,
        retrylimit: 0,
        retrydelay: 0,
        retrybackoff: false,
        data: { campaignParticipationId: 2 },
      });
    });
  });
});
