import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | Campaign | Domain | UseCase | update-campaign-code', function () {
  it('should update campaign code with given code', async function () {
    const campaignId = databaseBuilder.factory.buildCampaign({ code: '132456A' }).id;

    await databaseBuilder.commit();

    await usecases.updateCampaignCode({ campaignId, campaignCode: 'B12345698' });

    const { code: newCode } = await knex('campaigns').select('code').where('id', campaignId).first();

    expect(newCode).equals('B12345698');
  });
});
