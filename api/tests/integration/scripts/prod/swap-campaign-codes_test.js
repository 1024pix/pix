const { expect, databaseBuilder, knex } = require('../../../test-helper');
const { swapCampaignCodes } = require('../../../../scripts/prod/swap-campaign-codes.js');

describe('Integration | Scripts | swap-campaign-codes', function () {
  it('should swap campaign codes', async function () {
    const campaignId = databaseBuilder.factory.buildCampaign({ code: 'OLDCODE' }).id;
    const otherCampaignId = databaseBuilder.factory.buildCampaign({ code: 'NEWCODE' }).id;
    await databaseBuilder.commit();
    await swapCampaignCodes(campaignId, otherCampaignId);

    const { code: campaignCode } = await knex('campaigns').where({ id: campaignId }).first();
    const { code: otherCampaignCode } = await knex('campaigns').where({ id: otherCampaignId }).first();

    expect(campaignCode).equal('NEWCODE');
    expect(otherCampaignCode).equal('OLDCODE');
  });
});
