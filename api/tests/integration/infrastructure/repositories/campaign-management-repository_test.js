const { expect, databaseBuilder } = require('../../../test-helper');
const campaignManagementRepository = require('../../../../lib/infrastructure/repositories/campaign-management-repository');
const _ = require('lodash');
const Campaign = require('../../../../lib/domain/models/Campaign');
const { knex } = require('../../../../lib/infrastructure/bookshelf');

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
        creatorId: user.id,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: targetProfile.id,
        targetProfileName: targetProfile.name,
        title: campaign.title,
        customLandingPageText: campaign.customLandingPageText,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
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
        creatorId: user.id,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: null,
        targetProfileName: null,
        title: campaign.title,
        customLandingPageText: campaign.customLandingPageText,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
      });
    });
  });

  describe('#update', () => {
    it('should update the campaign', async () => {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({
        name: 'Bad campaign',
        title: null,
        customLandingPageText: null,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
      });
      await databaseBuilder.commit();

      const campaignAttributes = {
        name: 'Amazing campaign',
        title: 'Good title',
        customLandingPageText: 'End page',
        customResultPageText: 'Congrats you finished !',
        customResultPageButtonText: 'Continue here',
        customResultPageButtonUrl: 'www.next-step.net',
      };
      const expectedCampaign = databaseBuilder.factory.buildCampaign({ ...campaign, ...campaignAttributes });
      // when
      await campaignManagementRepository.update({ campaignId: campaign.id, campaignAttributes });
      const updatedCampaign = await knex('campaigns').where({ id: campaign.id }).first();

      // then
      expect(updatedCampaign).to.deep.equal(expectedCampaign);
    });

    it('should only update editable attributes', async () => {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({
        code: 'SOMECODE',
        name: 'some name',
      });
      await databaseBuilder.commit();

      const campaignAttributes = {
        code: 'NEWCODE',
        name: 'new name',
      };
      const expectedCampaign = databaseBuilder.factory.buildCampaign({ ...campaign, name: 'new name' });

      // when
      await campaignManagementRepository.update({ campaignId: campaign.id, campaignAttributes });
      const updatedCampaign = await knex('campaigns').where({ id: campaign.id }).first();

      // then
      expect(updatedCampaign).to.deep.equal(expectedCampaign);
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
          creatorId: creator.id,
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
