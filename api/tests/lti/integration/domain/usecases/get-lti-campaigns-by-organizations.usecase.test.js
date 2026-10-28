import { expect } from 'chai';

import { usecases } from '../../../../../src/lti/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | LTI | Domain | Usecases | getLtiCampaignsByOrganizations', function () {
  it('should return LTI campaigns', async function () {
    // given
    const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
    const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildCampaign({ organizationId: firstOrganizationId });
    databaseBuilder.factory.buildCampaign({ organizationId: firstOrganizationId });
    databaseBuilder.factory.buildCampaign({ organizationId: secondOrganizationId });
    databaseBuilder.factory.buildCampaign();
    await databaseBuilder.commit();

    // when
    const campaigns = await usecases.getLtiCampaignsByOrganizations({
      organizationIds: [firstOrganizationId, secondOrganizationId],
    });

    // then
    expect(campaigns.length).to.equal(3);
  });
});
