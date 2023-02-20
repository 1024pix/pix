import { expect, knex } from '../../../../test-helper';
import SendSharedParticipationResultsToPoleEmploiJob from '../../../../../lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiJob';

describe('Integration | Infrastructure | Jobs | CampaignResult | ParticipationResultCalculation', function () {
  afterEach(async function () {
    await knex('pgboss.job').delete();
  });

  describe('#schedule', function () {
    it('creates the send results job', async function () {
      const job = new SendSharedParticipationResultsToPoleEmploiJob(knex);

      await job.schedule({ params: 12 });

      const jobBDD = await knex('pgboss.job').where({ name: 'SendSharedParticipationResultsToPoleEmploi' }).first();

      expect(jobBDD.retrylimit).to.equal(0);
      expect(jobBDD.data).to.deep.equal({ params: 12 });
    });
  });
});
