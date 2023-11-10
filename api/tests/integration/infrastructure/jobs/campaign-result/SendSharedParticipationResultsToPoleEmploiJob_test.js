import { expect, knex } from '../../../../test-helper.js';
import { SendSharedParticipationResultsToPoleEmploiJob } from '../../../../../lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiJob.js';

describe('Integration | Infrastructure | Jobs | CampaignResult | SendSharedParticipationResultsToPoleEmploiJob', function () {
  describe('#schedule', function () {
    it('creates the send results job', async function () {
      const job = new SendSharedParticipationResultsToPoleEmploiJob(knex);

      await job.schedule({ params: 12 });

      const jobBDD = await knex('pgboss.job').where({ name: 'SendSharedParticipationResultsToPoleEmploiJob' }).first();

      expect(jobBDD.retrylimit).to.equal(0);
      expect(jobBDD.data).to.deep.equal({ params: 12 });
    });
  });
});
