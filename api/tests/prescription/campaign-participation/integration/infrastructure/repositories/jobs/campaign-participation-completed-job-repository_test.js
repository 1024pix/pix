import { CampaignParticipationCompletedJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipationCompletedJob.js';
import { campaignParticipationCompletedJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/campaign-participation-completed-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Repository | Jobs | CampaignParticipationCompletedJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const data = new CampaignParticipationCompletedJob({ campaignParticipationId: 123 });

      // when
      await campaignParticipationCompletedJobRepository.performAsync(data);

      // then
      await expect(CampaignParticipationCompletedJob.name).to.have.been.performed.withJobPayload({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: true,
        data,
      });
    });
  });
});
