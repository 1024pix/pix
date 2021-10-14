const _ = require('lodash');
const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const campaignReportRepository = require('../../../../lib/infrastructure/repositories/campaign-report-repository');
const CampaignReport = require('../../../../lib/domain/read-models/CampaignReport');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

const { STARTED } = CampaignParticipation.statuses;

describe('Integration | Repository | Campaign-Report', function () {
  describe('#get', function () {
    let campaign;
    let targetProfileId;

    beforeEach(function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      campaign = databaseBuilder.factory.buildCampaign({ targetProfileId, archivedAt: new Date() });
      return databaseBuilder.commit();
    });

    it('should return a CampaignReport by its id', async function () {
      // when
      const result = await campaignReportRepository.get(campaign.id);

      // then
      expect(result).to.be.an.instanceof(CampaignReport);
      expect(result).to.deep.include(
        _.pick(campaign, [
          'id',
          'name',
          'code',
          'createdAt',
          'archivedAt',
          'targetProfileId',
          'idPixLabel',
          'title',
          'type',
          'customLandingPageText',
          'creatorId',
          'creatorLastName',
          'creatorFirstName',
          'targetProfileId',
          'targetProfileName',
          'targetProfileImageUrl',
          'participationsCount',
          'sharedParticipationsCount',
        ])
      );
    });

    it('should only count participations not improved', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, isImproved: true });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, isImproved: false });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.get(campaign.id);

      // then
      expect(result.participationsCount).to.equal(1);
    });

    it('should only count shared participations not improved', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign.id,
        sharedAt: new Date(),
        isImproved: true,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign.id,
        sharedAt: null,
        status: STARTED,
        isImproved: false,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.get(campaign.id);

      // then
      expect(result.sharedParticipationsCount).to.equal(0);
    });

    it('should throw a NotFoundError if campaign can not be found', async function () {
      // given
      const nonExistentId = 666;

      // when
      const error = await catchErr(campaignReportRepository.get)(nonExistentId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#findMasteryRates', function () {
    let campaignId;

    beforeEach(function () {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      return databaseBuilder.commit();
    });

    it('should return array with result', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.3 });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRates(campaignId);

      // then
      expect(result).to.be.instanceOf(Array);
      expect(result).to.deep.equal([0.1, 0.3]);
    });

    it('should only take into account participations not improved', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, isImproved: true });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.3, isImproved: false });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRates(campaignId);

      // then
      expect(result).to.deep.equal([0.3]);
    });

    it('should only take into account shared participations', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, sharedAt: new Date() });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0.3,
        sharedAt: null,
        status: STARTED,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRates(campaignId);

      // then
      expect(result).to.deep.equal([0.1]);
    });

    it('should return empty array if campaign can not be found', async function () {
      // given
      const nonExistentId = 666;

      // when
      const result = await campaignReportRepository.findMasteryRates(nonExistentId);

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#findPaginatedFilteredByOrganizationId', function () {
    let filter, page;
    let organizationId, targetProfileId, creatorId;
    let campaign;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      targetProfileId = databaseBuilder.factory.buildTargetProfile({ organizationId }).id;
      creatorId = databaseBuilder.factory.buildUser({}).id;
      await databaseBuilder.commit();

      filter = {};
      page = { number: 1, size: 4 };
    });

    context('when the given organization has no campaign', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildCampaign({ organizationId });
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        // when
        const { models: campaignsWithReports, meta } =
          await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId: otherOrganizationId,
            filter,
            page,
          });

        // then
        expect(campaignsWithReports).to.deep.equal([]);
        expect(meta.hasCampaigns).to.equal(false);
      });
    });

    context('when the given organization has campaigns', function () {
      it('should return campaign with all attributes', async function () {
        // given
        campaign = databaseBuilder.factory.buildCampaign({
          name: 'campaign name',
          code: 'AZERTY789',
          organizationId,
          targetProfileId,
          creatorId,
        });
        await databaseBuilder.commit();

        // when
        const { models: campaignsWithReports } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
          organizationId,
          filter,
          page,
        });

        // then
        expect(campaignsWithReports[0]).to.be.instanceof(CampaignReport);
        expect(campaignsWithReports[0]).to.deep.include(
          _.pick(campaign, [
            'id',
            'name',
            'code',
            'createdAt',
            'archivedAt',
            'targetProfileId',
            'idPixLabel',
            'title',
            'type',
            'customLandingPageText',
            'creatorId',
            'creatorLastName',
            'creatorFirstName',
            'targetProfileId',
            'targetProfileName',
            'targetProfileImageUrl',
            'participationsCount',
            'sharedParticipationsCount',
          ])
        );
      });

      it('should return hasCampaign to true if the organization has one campaign at least', async function () {
        // given
        const organizationId2 = databaseBuilder.factory.buildOrganization({}).id;
        databaseBuilder.factory.buildCampaign({
          organizationId: organizationId2,
          targetProfileId,
          creatorId,
        });
        databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId,
          creatorId,
        });
        await databaseBuilder.commit();

        // when
        const { meta } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
          organizationId,
          filter,
          page,
        });

        // then
        expect(meta.hasCampaigns).to.equal(true);
      });

      it('should sort campaigns by descending creation date', async function () {
        // given
        const createdAtInThePast = new Date('2010-07-30T09:35:45Z');
        const createdAtInThePresent = new Date('2020-07-30T09:35:45Z');
        const createdAtInTheFuture = new Date('2030-07-30T09:35:45Z');

        const campaignBInThePastId = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'B',
          createdAt: createdAtInThePast,
        }).id;
        const campaignAInThePresentId = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'A',
          createdAt: createdAtInThePresent,
        }).id;
        const campaignCInTheFutureId = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'C',
          createdAt: createdAtInTheFuture,
        }).id;
        databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'D',
          createdAt: createdAtInThePast,
          archivedAt: createdAtInThePresent,
        });
        await databaseBuilder.commit();

        // when
        const { models: campaignsWithReports } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
          organizationId,
          filter,
          page,
        });

        // then
        expect(campaignsWithReports).to.have.lengthOf(3);
        expect(_.map(campaignsWithReports, 'id')).to.deep.equal([
          campaignCInTheFutureId,
          campaignAInThePresentId,
          campaignBInThePastId,
        ]);
      });

      context('when campaigns have participants', function () {
        it('should only count participations not improved', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId });
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, isImproved: false });
          await databaseBuilder.commit();

          // when
          const { models: campaignReports } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

          // then
          expect(campaignReports[0].participationsCount).to.equal(1);
        });

        it('should only count shared participations not improved', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId });
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign.id,
            sharedAt: new Date(),
            isImproved: true,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign.id,
            isImproved: false,
            status: STARTED,
            sharedAt: null,
          });
          await databaseBuilder.commit();

          // when
          const { models: campaignReports } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

          // then
          expect(campaignReports[0].sharedParticipationsCount).to.equal(0);
        });

        it('should return correct participations count and shared participations count', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId });
          _.each(
            [
              { campaignId: campaign.id },
              { campaignId: campaign.id, status: STARTED },
              { campaignId: campaign.id, status: STARTED },
            ],
            (campaignParticipation) => {
              databaseBuilder.factory.buildCampaignParticipation(campaignParticipation);
            }
          );
          await databaseBuilder.commit();

          // when
          const { models: campaignReports } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

          // then
          expect(campaignReports[0]).to.be.instanceOf(CampaignReport);
          expect(campaignReports[0]).to.include({
            id: campaign.id,
            participationsCount: 3,
            sharedParticipationsCount: 1,
          });
        });
      });

      context('when campaigns do not have participants', function () {
        it('should return 0 as participations count and as shared participations count', async function () {
          // given
          campaign = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId });
          await databaseBuilder.commit();

          // when
          const { models: campaignReports } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

          // then
          expect(campaignReports[0]).to.include({
            id: campaign.id,
            participationsCount: 0,
            sharedParticipationsCount: 0,
          });
        });
      });

      context('when some campaigns matched the archived filter', function () {
        it('should be able to retrieve only campaigns that are archived', async function () {
          // given
          organizationId = databaseBuilder.factory.buildOrganization().id;
          const archivedCampaign = databaseBuilder.factory.buildCampaign({
            organizationId,
            archivedAt: new Date('2010-07-30T09:35:45Z'),
          });
          databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: null });
          filter.ongoing = false;

          await databaseBuilder.commit();
          // when
          const { models: archivedCampaigns } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

          // then
          expect(archivedCampaigns).to.have.lengthOf(1);
          expect(archivedCampaigns[0].id).to.equal(archivedCampaign.id);
          expect(archivedCampaigns[0].archivedAt).to.deep.equal(archivedCampaign.archivedAt);
        });
      });

      context('when some campaigns names match the "name" search pattern', function () {
        // given
        const filter = { name: 'matH' };

        beforeEach(function () {
          _.each([{ name: 'Maths L1' }, { name: 'Maths L2' }, { name: 'Chimie' }], (campaign) => {
            databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
          });

          return databaseBuilder.commit();
        });

        it('should return these campaigns only', async function () {
          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Maths L2']);
        });
      });

      context('when some campaigns creator firstName match the given creatorName searched', function () {
        let filter;

        beforeEach(function () {
          const creator1 = databaseBuilder.factory.buildUser({ firstName: 'Robert' });
          const creator2 = databaseBuilder.factory.buildUser({ firstName: 'Bernard' });

          filter = { creatorName: creator1.firstName.toUpperCase() };

          _.each(
            [
              { name: 'Maths L1', creatorId: creator1.id },
              { name: 'Maths L2', creatorId: creator2.id },
              { name: 'Chimie', creatorId: creator1.id },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );

          return databaseBuilder.commit();
        });

        it('should return the matching campaigns', async function () {
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Chimie']);
        });
      });

      context('when some campaigns creator lastName match the given creatorName searched', function () {
        let filter;

        beforeEach(function () {
          const creator1 = databaseBuilder.factory.buildUser({ lastName: 'Redford' });
          const creator2 = databaseBuilder.factory.buildUser({ lastName: 'Menez' });

          filter = { creatorName: creator1.lastName.toUpperCase() };

          _.each(
            [
              { name: 'Maths L1', creatorId: creator1.id },
              { name: 'Maths L2', creatorId: creator2.id },
              { name: 'Chimie', creatorId: creator1.id },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );

          return databaseBuilder.commit();
        });

        it('should return the matching campaigns', async function () {
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Chimie']);
        });
      });

      context('when the given filter search property is not searchable', function () {
        // given
        const filter = { code: 'FAKECODE' };
        const page = { number: 1, size: 10 };

        beforeEach(function () {
          databaseBuilder.factory.buildCampaign({ organizationId });
          return databaseBuilder.commit();
        });

        it('should ignore the filter and return all campaigns', async function () {
          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(actualCampaignsWithReports).to.have.lengthOf(1);
        });
      });

      context('when campaigns amount exceed page size', function () {
        // given
        let expectedPagination;

        beforeEach(function () {
          _.times(5, () => databaseBuilder.factory.buildCampaign({ organizationId }));
          expectedPagination = { page: page.number, pageSize: page.size, pageCount: 2, rowCount: 5 };
          return databaseBuilder.commit();
        });

        it('should return page size number of campaigns', async function () {
          // when
          const { models: campaignsWithReports, meta: pagination } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(campaignsWithReports).to.have.lengthOf(4);
          expect(pagination).to.include(expectedPagination);
        });
      });
    });
  });
});
