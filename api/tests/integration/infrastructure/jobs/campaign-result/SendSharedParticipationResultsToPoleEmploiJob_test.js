import { SendSharedParticipationResultsToPoleEmploiJob } from '../../../../../src/shared/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiJob.js';
import { expect, knex } from '../../../../test-helper.js';

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
