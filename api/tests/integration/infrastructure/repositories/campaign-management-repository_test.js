const { expect, databaseBuilder } = require('../../../test-helper');
const campaignManagementRepository = require('../../../../lib/infrastructure/repositories/campaign-management-repository');
const _ = require('lodash');
const Campaign = require('../../../../lib/domain/models/Campaign');
const { knex } = require('../../../../lib/infrastructure/bookshelf');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

const { SHARED, TO_SHARE, STARTED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign-Management', function () {
  describe('#get', function () {
    it('should return campaign details with target profile', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const owner = databaseBuilder.factory.buildUser();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization({});
      const campaign = databaseBuilder.factory.buildCampaign({
        creatorId: user.id,
        ownerId: owner.id,
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
        idPixLabel: campaign.idPixLabel,
        createdAt: campaign.createdAt,
        archivedAt: campaign.archivedAt,
        creatorFirstName: user.firstName,
        creatorLastName: user.lastName,
        creatorId: user.id,
        ownerId: owner.id,
        ownerFirstName: owner.firstName,
        ownerLastName: owner.lastName,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: targetProfile.id,
        targetProfileName: targetProfile.name,
        title: campaign.title,
        customLandingPageText: campaign.customLandingPageText,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
        sharedParticipationsCount: 0,
        totalParticipationsCount: 0,
      });
    });

    it('should return campaign details without target profile', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const owner = databaseBuilder.factory.buildUser();
      const organization = databaseBuilder.factory.buildOrganization({});
      const campaign = databaseBuilder.factory.buildCampaign({
        type: Campaign.types.PROFILES_COLLECTION,
        creatorId: user.id,
        ownerId: owner.id,
        organizationId: organization.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.get(campaign.id);

      // then
      expect(result).to.deep.include({
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        type: campaign.type,
        idPixLabel: campaign.idPixLabel,
        createdAt: campaign.createdAt,
        archivedAt: campaign.archivedAt,
        creatorFirstName: user.firstName,
        creatorLastName: user.lastName,
        creatorId: user.id,
        ownerId: owner.id,
        ownerFirstName: owner.firstName,
        ownerLastName: owner.lastName,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: null,
        targetProfileName: null,
        title: campaign.title,
        customLandingPageText: campaign.customLandingPageText,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
        totalParticipationsCount: 0,
        sharedParticipationsCount: 0,
      });
    });

    describe('When there are participation', function () {
      context('when campaign type is ASSESSMENT', function () {
        it('should return total and shared participations count', async function () {
          //given
          const campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: STARTED,
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: TO_SHARE,
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: SHARED,
          });

          await databaseBuilder.commit();
          // when
          const result = await campaignManagementRepository.get(campaign.id);

          expect(result.totalParticipationsCount).to.equal(3);
          expect(result.sharedParticipationsCount).to.equal(1);
        });

        context('when campaign type is PROFILES_COLLECTION', function () {
          it('should return total and shared participations count', async function () {
            //given
            const userId = databaseBuilder.factory.buildUser().id;
            const organization = databaseBuilder.factory.buildOrganization({});
            const campaign = databaseBuilder.factory.buildCampaign({
              creatorId: userId,
              organizationId: organization.id,
              type: Campaign.types.PROFILES_COLLECTION,
            });

            databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              status: SHARED,
            });

            await databaseBuilder.commit();

            // when
            const result = await campaignManagementRepository.get(campaign.id);

            expect(result.totalParticipationsCount).to.equal(1);
            expect(result.sharedParticipationsCount).to.equal(1);
          });
        });
      });
    });
  });

  describe('#update', function () {
    it('should update the campaign', async function () {
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

    it('should only update editable attributes', async function () {
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

  describe('#findPaginatedCampaignManagements', function () {
    let page;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      await databaseBuilder.commit();

      page = { number: 1, size: 3 };
    });

    context('when the given organization has no campaign', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({
          organizationId,
          page,
        });

        // then
        expect(campaignManagements).to.be.empty;
      });
    });

    context('when the given organization has campaigns', function () {
      it('should return campaign with all attributes', async function () {
        // given
        const owner = databaseBuilder.factory.buildUser({
          lastName: 'Queen',
          firstName: 'Elizabeth',
        });
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
          ownerId: owner.id,
        });
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({
          organizationId,
          page,
        });

        // then
        expect(campaignManagements[0]).to.deep.includes({
          id: campaign.id,
          name: campaign.name,
          code: campaign.code,
          idPixLabel: campaign.idPixLabel,
          createdAt: campaign.createdAt,
          archivedAt: campaign.archivedAt,
          type: campaign.type,
          creatorLastName: creator.lastName,
          creatorFirstName: creator.firstName,
          creatorId: creator.id,
          ownerId: owner.id,
          ownerFirstName: owner.firstName,
          ownerLastName: owner.lastName,
        });
      });

      it('should sort campaigns by descending creation date', async function () {
        // given
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'May', createdAt: new Date('2020-05-01') }).id;
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'June', createdAt: new Date('2020-06-01') }).id;
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'July', createdAt: new Date('2020-07-01') }).id;
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({
          organizationId,
          page,
        });

        // then
        expect(_.map(campaignManagements, 'name')).to.exactlyContainInOrder(['July', 'June', 'May']);
      });
    });

    context('when campaigns amount exceed page size', function () {
      it('should return page size number of campaigns', async function () {
        page = { number: 2, size: 2 };

        _.times(4, () => databaseBuilder.factory.buildCampaign({ organizationId }));
        const expectedPagination = { page: 2, pageSize: 2, pageCount: 2, rowCount: 4 };
        await databaseBuilder.commit();
        // when
        const { models: campaignManagements, meta: pagination } =
          await campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });

        // then
        expect(campaignManagements).to.have.lengthOf(2);
        expect(pagination).to.include(expectedPagination);
      });
    });
  });
});
