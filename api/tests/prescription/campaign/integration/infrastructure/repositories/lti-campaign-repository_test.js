import { expect } from 'chai';

import { LtiCampaign } from '../../../../../../src/prescription/campaign/domain/models/LtiCampaign.js';
import * as ltiCampaignRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/lti-campaign-repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Repository | Lti-Campaign', function () {
  describe('#getAllByOrganizationIds', function () {
    it('returns campaigns by organizationIds', async function () {
      // given
      const firstOrganizationId = databaseBuilder.factory.buildOrganization({ name: 'Pix organization' }).id;
      const secondOrganizationId = databaseBuilder.factory.buildOrganization({ name: 'FWB organization' }).id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile({ description: 'Parcours rentrée 6ieme' }).id;
      databaseBuilder.factory.buildCampaign({
        code: 'QWERTY',
        name: 'Campagne 6A',
        organizationId: firstOrganizationId,
      });
      const campaign1 = databaseBuilder.factory.buildCampaign({
        code: 'AZERTY',
        targetProfileId,
        name: 'Campagne 6A',
        type: 'ASSESSMENT',
        organizationId: firstOrganizationId,
      });
      databaseBuilder.factory.buildCampaign({ organizationId: secondOrganizationId });
      databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      // when
      const campaigns = await ltiCampaignRepository.getAllByOrganizationIds({
        organizationIds: [firstOrganizationId, secondOrganizationId],
      });

      // then
      expect(campaigns.length).to.equal(3);
      expect(campaigns[0]).to.be.an.instanceOf(LtiCampaign);
      expect(campaigns[0]).deep.equal({
        id: campaign1.id,
        description: 'Parcours rentrée 6ieme',
        code: 'AZERTY',
        name: 'Campagne 6A',
        organizationName: 'Pix organization',
        type: 'ASSESSMENT',
      });
    });
  });
});
