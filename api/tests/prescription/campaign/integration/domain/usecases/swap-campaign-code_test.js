import { SwapCampaignMismatchOrganizationError } from '../../../../../../src/prescription/campaign/domain/errors.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Campaign | Domain | UseCase | swap-campaign-code', function () {
  let organizationId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;

    await databaseBuilder.commit();
  });

  it('should swap the codes', async function () {
    // given
    const firstCampaignId = databaseBuilder.factory.buildCampaign({ code: 'ABCDE', organizationId }).id;
    const secondCampaignId = databaseBuilder.factory.buildCampaign({ code: 'FGEHIJKL', organizationId }).id;

    await databaseBuilder.commit();

    // when
    await usecases.swapCampaignCodes({
      firstCampaignId,
      secondCampaignId,
    });

    // then
    const { code: fisrtCode } = await knex('campaigns').select('code').where('id', firstCampaignId).first();
    expect(fisrtCode).equal('FGEHIJKL');

    const { code: secondCode } = await knex('campaigns').select('code').where('id', secondCampaignId).first();
    expect(secondCode).equal('ABCDE');
  });

  it('should throw SwapCampaignMismatchOrganizationError on campaign from different organization', async function () {
    const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

    const firstCampaignId = databaseBuilder.factory.buildCampaign({ code: 'ABCDE', organizationId }).id;
    const secondCampaignId = databaseBuilder.factory.buildCampaign({
      code: 'FGEHIJKL',
      organizationId: otherOrganizationId,
    }).id;

    await databaseBuilder.commit();

    const error = await catchErr(usecases.swapCampaignCodes)({
      firstCampaignId,
      secondCampaignId,
    });

    expect(error).to.be.an.instanceOf(SwapCampaignMismatchOrganizationError);
  });
});
