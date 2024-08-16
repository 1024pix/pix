import { CampaignParticipationCompletedJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipationCompletedJob.js';
import { campaignParticipationCompletedJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/campaign-participation-completed-job-repository.js';
import { expect } from '../../../../../../test-helper.js';
import { jobs } from '../../../../../../tooling/jobs/expect-job.js';

describe('Integration | Repository | Jobs | CampaignParticipationCompletedJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const data = new CampaignParticipationCompletedJob({ campaignParticipationId: 123 });

      // when
      await campaignParticipationCompletedJobRepository.performAsync(data);

      // then
      const results = await jobs(CampaignParticipationCompletedJob.name);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.deep.contains({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: true,
        data,
      });
    });
  });
});
