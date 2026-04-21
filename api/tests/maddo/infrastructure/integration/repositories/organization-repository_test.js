import { POLE_EMPLOI } from '../../../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { Organization } from '../../../../../src/maddo/domain/models/Organization.js';
import {
  findByIds,
  findIdentityProviderForCampaignsByCampaignId,
  findIdsByTagNames,
} from '../../../../../src/maddo/infrastructure/repositories/organization-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Maddo | Infrastructure | Repositories | Integration | organization', function () {
  describe('#findIdsByTagNames', function () {
    it('lists organizations ids belonging to all given tag names', async function () {
      // given
      const { id: organizationId1 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId2 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId3 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId4 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId5 } = databaseBuilder.factory.buildOrganization();

      const { id: tagId1 } = databaseBuilder.factory.buildTag({ name: 'tag1' });
      const { id: tagId2 } = databaseBuilder.factory.buildTag({ name: 'tag2' });
      const { id: tagId3 } = databaseBuilder.factory.buildTag({ name: 'tag3' });

      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationId1, tagId: tagId1 });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationId1, tagId: tagId3 });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationId2, tagId: tagId2 });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationId3, tagId: tagId1 });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationId4, tagId: tagId3 });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationId5, tagId: tagId1 });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationId5, tagId: tagId2 });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationId5, tagId: tagId3 });

      await databaseBuilder.commit();

      const tagNames = ['tag1', 'tag3'];

      // when
      const ids = await findIdsByTagNames(tagNames);

      // then
      expect(ids).to.deep.equal([organizationId1, organizationId5]);
    });
  });

  describe('#findByIds', function () {
    it('find organizations for given ids', async function () {
      //given
      const organization1 = databaseBuilder.factory.buildOrganization({ externalId: 'external-id1' });
      const organization2 = databaseBuilder.factory.buildOrganization({ externalId: 'external-id2' });
      databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      //when
      const organizations = await findByIds([organization1.id, organization2.id]);

      //then
      expect(organizations).to.deep.equal([
        new Organization({ id: organization1.id, name: organization1.name, externalId: 'external-id1' }),
        new Organization({
          id: organization2.id,
          name: organization2.name,
          externalId: 'external-id2',
        }),
      ]);
    });
  });

  describe('#findIdentityProviderForCampaignsByCampaignId', function () {
    it('returns the identity provider for campaigns associated with the given campaign', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({
        identityProviderForCampaigns: POLE_EMPLOI.code,
      });
      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const identityProviderForCampaigns = await findIdentityProviderForCampaignsByCampaignId(campaign.id);

      // then
      expect(identityProviderForCampaigns).to.equal(POLE_EMPLOI.code);
    });

    it('returns null when the organization has no identity provider for campaigns', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({
        identityProviderForCampaigns: null,
      });
      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const identityProviderForCampaigns = await findIdentityProviderForCampaignsByCampaignId(campaign.id);

      // then
      expect(identityProviderForCampaigns).to.be.null;
    });
  });
});
