import { PoleEmploiParticipationStartedJob } from '../../../../../../../src/prescription/campaign-participation/domain/models/PoleEmploiParticipationStartedJob.js';
import { poleEmploiParticipationStartedJobRepository } from '../../../../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/pole-emploi-participation-started-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Application | Jobs | certificationRescoringByScriptJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      const poleEmploiParticipationStartedJob = new PoleEmploiParticipationStartedJob({
        campaignParticipationId: 777,
      });

      await poleEmploiParticipationStartedJobRepository.performAsync(poleEmploiParticipationStartedJob);

      // then
      await expect(PoleEmploiParticipationStartedJob.name).to.have.been.performed.withJob({
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
