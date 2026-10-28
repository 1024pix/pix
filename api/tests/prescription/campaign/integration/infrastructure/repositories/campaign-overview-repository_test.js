import { expect } from 'chai';

import { CampaignOverview } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignOverview.js';
import * as campaignOverviewRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-overview-repository.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.ts';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Repository | Campaign-Overview', function () {
  describe('#getAllByOrganizationIds', function () {
    it('returns only campaigns from given organizationIds', async function () {
      // given
      const firstOrganizationId = databaseBuilder.factory.buildOrganization({ name: 'Pix organization' }).id;
      const secondOrganizationId = databaseBuilder.factory.buildOrganization({ name: 'FWB organization' }).id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile({ description: 'Parcours rentrée 6ieme' }).id;
      const campaign1 = databaseBuilder.factory.buildCampaign({
        code: 'QWERTY',
        name: 'Campagne 6A',
        organizationId: firstOrganizationId,
        targetProfileId,
      });
      databaseBuilder.factory.buildCampaign({ organizationId: secondOrganizationId });
      await databaseBuilder.commit();

      // when
      const campaigns = await campaignOverviewRepository.getAllByOrganizationIds({
        organizationIds: [firstOrganizationId],
      });

      // then
      expect(campaigns.length).to.equal(1);
      expect(campaigns[0]).to.be.an.instanceOf(CampaignOverview);
      expect(campaigns[0]).deep.equal({
        id: campaign1.id,
        description: 'Parcours rentrée 6ieme',
        code: 'QWERTY',
        name: 'Campagne 6A',
        organizationName: 'Pix organization',
        organizationId: firstOrganizationId,
        targetProfileId,
        type: CampaignTypes.ASSESSMENT,
      });
    });
    it('sorts campaigns by organizationIds, campaignName and code', async function () {
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
      await databaseBuilder.commit();

      // when
      const campaigns = await campaignOverviewRepository.getAllByOrganizationIds({
        organizationIds: [firstOrganizationId, secondOrganizationId],
      });

      // then
      expect(campaigns.length).to.equal(3);
      expect(campaigns[0]).to.be.an.instanceOf(CampaignOverview);
      expect(campaigns[0]).deep.equal({
        id: campaign1.id,
        description: 'Parcours rentrée 6ieme',
        code: 'AZERTY',
        name: 'Campagne 6A',
        targetProfileId: campaign1.targetProfileId,
        organizationName: 'Pix organization',
        organizationId: firstOrganizationId,
        type: 'ASSESSMENT',
      });
    });
    it('returns PROFILE_COLLECTION campaigns by organizationIds', async function () {
      // given
      const firstOrganizationId = databaseBuilder.factory.buildOrganization({ name: 'Pix organization' }).id;
      const campaign1 = databaseBuilder.factory.buildCampaign({
        code: 'AZERTY',
        name: 'Collecte de profils 6A',
        type: CampaignTypes.PROFILES_COLLECTION,
        organizationId: firstOrganizationId,
      });
      await databaseBuilder.commit();

      // when
      const campaigns = await campaignOverviewRepository.getAllByOrganizationIds({
        organizationIds: [firstOrganizationId],
      });

      // then
      expect(campaigns.length).to.equal(1);
      expect(campaigns[0]).to.be.an.instanceOf(CampaignOverview);
      expect(campaigns[0]).deep.equal({
        id: campaign1.id,
        code: 'AZERTY',
        name: 'Collecte de profils 6A',
        description: null,
        organizationName: 'Pix organization',
        organizationId: firstOrganizationId,
        type: CampaignTypes.PROFILES_COLLECTION,
        targetProfileId: null,
      });
    });
  });
});
