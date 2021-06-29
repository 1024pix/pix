const { expect, databaseBuilder } = require('../../../test-helper');
const campaignManagementRepository = require('../../../../lib/infrastructure/repositories/campaign-management-repository');
const _ = require('lodash');
const Campaign = require('../../../../lib/domain/models/Campaign');

describe('Integration | Repository | Campaign-Management', () => {

  describe('#get', () => {
    it('should return campaign details with target profile', async () => {
      // given
      const user = databaseBuilder.factory.buildUser();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization({});
      const campaign = databaseBuilder.factory.buildCampaign({
        creatorId: user.id,
        targetProfileId: targetProfile.id,
        organizationId: organization.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.get(campaign.id);

      // then
      expect(result).to.deep.equal({
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        type: campaign.type,
        createdAt: campaign.createdAt,
        archivedAt: campaign.archivedAt,
        creatorFirstName: user.firstName,
        creatorLastName: user.lastName,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: targetProfile.id,
        targetProfileName: targetProfile.name,
      });
    });

    it('should return campaign details without target profile', async () => {
      // given
      const user = databaseBuilder.factory.buildUser();
      const organization = databaseBuilder.factory.buildOrganization({});
      const campaign = databaseBuilder.factory.buildCampaign({
        type: Campaign.types.PROFILES_COLLECTION,
        creatorId: user.id,
        organizationId: organization.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.get(campaign.id);

      // then
      expect(result).to.deep.equal({
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        type: campaign.type,
        createdAt: campaign.createdAt,
        archivedAt: campaign.archivedAt,
        creatorFirstName: user.firstName,
        creatorLastName: user.lastName,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: null,
        targetProfileName: null,
      });
    });
  });

  describe('#findPaginatedCampaignManagements', () => {
    let page;
    let organizationId;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      await databaseBuilder.commit();

      page = { number: 1, size: 3 };
    });

    context('when the given organization has no campaign', () => {

      it('should return an empty array', async () => {
        // given
        databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });

        // then
        expect(campaignManagements).to.be.empty;
      });
    });

    context('when the given organization has campaigns', () => {

      it('should return campaign with all attributes', async () => {
        // given
        const creator = databaseBuilder.factory.buildUser({
          lastName: 'King',
          firstName: 'Arthur',
        });
        const campaign = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'campaign name',
          code: 'AZERTY789',
          createdAt: new Date('2021-01-01'),
          archivedAt: new Date('2021-01-01'),
          type: 'ASSESSMENT',
          creatorId: creator.id,
        });
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });

        // then
        expect(campaignManagements[0]).to.deep.equal({
          id: campaign.id,
          name: campaign.name,
          code: campaign.code,
          createdAt: campaign.createdAt,
          archivedAt: campaign.archivedAt,
          type: campaign.type,
          creatorLastName: creator.lastName,
          creatorFirstName: creator.firstName,
        });
      });

      it('should sort campaigns by descending creation date', async () => {
        // given
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'May', createdAt: new Date('2020-05-01') }).id;
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'June', createdAt: new Date('2020-06-01') }).id;
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'July', createdAt: new Date('2020-07-01') }).id;
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });

        // then
        expect(_.map(campaignManagements, 'name')).to.exactlyContainInOrder([ 'July', 'June', 'May']);
      });
    });

    context('when campaigns amount exceed page size', () => {

      it('should return page size number of campaigns', async () => {
        page = { number: 2, size: 2 };

        _.times(4, () => databaseBuilder.factory.buildCampaign({ organizationId }));
        const expectedPagination = { page: 2, pageSize: 2, pageCount: 2, rowCount: 4 };
        await databaseBuilder.commit();
        // when
        const { models: campaignManagements, meta: pagination } = await campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });

        // then
        expect(campaignManagements).to.have.lengthOf(2);
        expect(pagination).to.include(expectedPagination);
      });
    });
  });
});
