import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { Membership } from '../../../../../../src/shared/domain/models/Membership.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | Campaign | Domain | UseCase | update-campaign', function () {
  it('update campaign attributes given payload', async function () {
    const ownerId = databaseBuilder.factory.buildUser().id;
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildMembership({
      userId: ownerId,
      organizationId,
      organizationRole: Membership.roles.MEMBER,
    });
    const campaignId = databaseBuilder.factory.buildCampaign({
      name: 'say my name !',
      code: 'ABCDEF',
      title: 'Heisenberg',
      customLandingPageText: 'òla !',
      organizationId,
    }).id;

    await databaseBuilder.commit();

    await usecases.updateCampaign({
      campaignId,
      ownerId,
      name: 'no no no',
      title: 'yeah yeah yeah',
      customLandingPageText: 'hello from the otter side',
    });

    const campaignAttributes = await knex('campaigns')
      .select('ownerId', 'name', 'title', 'customLandingPageText', 'code')
      .where('id', campaignId)
      .first();

    expect(campaignAttributes).deep.equal({
      ownerId,
      name: 'no no no',
      title: 'yeah yeah yeah',
      customLandingPageText: 'hello from the otter side',
      code: 'ABCDEF',
    });
  });
});
