import { Campaign } from '../../../../../src/maddo/domain/models/Campaign.js';
import { findByOrganizationId } from '../../../../../src/maddo/infrastructure/repositories/campaign-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Maddo | Infrastructure | Repositories | Integration | campaign', function () {
  describe('#findByOrganizationId', function () {
    it('lists campaigns belonging to organization with given id', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const { id: otherOrganizationId } = databaseBuilder.factory.buildOrganization();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign1 = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
        createdAt: new Date('2026-01-01'),
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
        createdAt: new Date('2026-01-02'),
        archivedAt: new Date('2026-01-03'),
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
        createdAt: new Date('2026-01-02'),
        deletedAt: new Date('2026-01-03'),
      });
      const campaign2 = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
        createdAt: new Date('2026-01-03'),
      });
      databaseBuilder.factory.buildCampaign({ organizationId: otherOrganizationId });

      await databaseBuilder.commit();

      // when
      const { campaigns, page } = await findByOrganizationId(organization.id, { number: 1, size: 10 });

      // then
      expect(page).to.deep.equal({
        number: 1,
        size: 10,
        count: 1,
      });
      expect(campaigns).to.deep.equal([
        new Campaign({
          id: campaign2.id,
          name: campaign2.name,
          type: campaign2.type,
          targetProfileName: targetProfile.name,
          code: campaign2.code,
          archivedAt: campaign2.archivedAt,
          createdAt: campaign2.createdAt,
        }),
        new Campaign({
          id: campaign1.id,
          name: campaign1.name,
          type: campaign1.type,
          targetProfileName: targetProfile.name,
          code: campaign1.code,
          createdAt: campaign1.createdAt,
          archivedAt: campaign1.archivedAt,
        }),
      ]);
    });
  });
});
