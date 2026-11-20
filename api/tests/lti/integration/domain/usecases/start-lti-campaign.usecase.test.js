import { expect } from 'chai';

import { usecases } from '../../../../../src/lti/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | LTI | Domain | Usecases | startLtiCampaign', function () {
  it('saves the LTI campaign participation', async function () {
    // given
    const platform = databaseBuilder.factory.buildLtiPlatform();
    const clientId = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId: platform.id }).clientId;
    const campaignId = databaseBuilder.factory.buildCampaign().id;
    await databaseBuilder.commit();

    // when
    await usecases.startLtiCampaign({
      clientId,
      platformUserSub: '1234',
      lineItemContainerUrl: 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
      campaignId,
    });

    // then
    const rows = await knex('lti_campaign_participations').select(
      'clientId',
      'platformUserSub',
      'lineItemContainerUrl',
      'campaignId',
    );
    expect(rows).to.deep.equal([
      {
        clientId,
        platformUserSub: '1234',
        lineItemContainerUrl: 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
        campaignId,
      },
    ]);
  });
});
