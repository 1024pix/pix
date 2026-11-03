import { expect } from 'chai';

import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | get-campaigns-by-organizations', function () {
  it('returns the campaigns of the organizations', async function () {
    // given
    const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
    const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildCampaign({ organizationId: firstOrganizationId });
    databaseBuilder.factory.buildCampaign({ organizationId: firstOrganizationId });
    databaseBuilder.factory.buildCampaign({ organizationId: secondOrganizationId });
    databaseBuilder.factory.buildCampaign();
    await databaseBuilder.commit();

    // when
    const campaigns = await usecases.getCampaignOverviewsByOrganizations({
      organizationIds: [firstOrganizationId, secondOrganizationId],
    });

    // then
    expect(campaigns.length).to.equal(3);
  });
});
