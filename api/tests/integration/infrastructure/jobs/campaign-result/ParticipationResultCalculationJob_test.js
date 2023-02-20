import { expect, knex } from '../../../../test-helper';
import ParticipationResultCalculationJob from '../../../../../lib/infrastructure/jobs/campaign-result/ParticipationResultCalculationJob';

describe('Integration | Infrastructure | Jobs | CampaignResult | ParticipationResultCalculation', function () {
  afterEach(async function () {
    await knex('pgboss.job').delete();
  });

  describe('#schedule', function () {
    it('creates the results calculation job', async function () {
      const handler = new ParticipationResultCalculationJob(knex);

      await handler.schedule({ params: 1 });

      const job = await knex('pgboss.job').where({ name: 'ParticipationResultCalculationJob' }).first();

      expect(job.retrylimit).to.equal(3);
      expect(job.data).to.deep.equal({ params: 1 });
    });
  });
});
