import { usecases } from '../../../../../../src/maddo/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Maddo | Domain | Usecase | Get campaign organization id', function () {
  it('returns the organization id for a given campaign', async function () {
    // given
    const { id: expectedOrganizationId } = databaseBuilder.factory.buildOrganization();
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId: expectedOrganizationId });
    await databaseBuilder.commit();

    // when
    const organizationId = await usecases.getCampaignOrganizationId({ campaignId });

    // then
    expect(organizationId).to.equal(expectedOrganizationId);
  });

  context('when the campaign does not exist', function () {
    it('returns undefined', async function () {
      // given
      const campaignId = -1;

      // when
      const organizationId = await usecases.getCampaignOrganizationId({ campaignId });

      // then
      expect(organizationId).to.be.undefined;
    });
  });
});
