import { ParticipationResultCalculationJob } from '../../../../../src/shared/infrastructure/jobs/campaign-result/ParticipationResultCalculationJob.js';
import { expect, knex } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Jobs | CampaignResult | ParticipationResultCalculation', function () {
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
