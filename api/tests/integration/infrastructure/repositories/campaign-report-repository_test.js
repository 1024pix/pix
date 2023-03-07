const _ = require('lodash');
const { expect, databaseBuilder, catchErr, mockLearningContent } = require('../../../test-helper');
const campaignReportRepository = require('../../../../lib/infrastructure/repositories/campaign-report-repository');
const CampaignReport = require('../../../../lib/domain/read-models/CampaignReport');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

const { STARTED, SHARED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign-Report', function () {
  describe('#get', function () {
    context('campaign information', function () {
      it('returns informations about campaign', async function () {
        const creator = databaseBuilder.factory.buildUser({ firstName: 'Walter', lastName: 'White' });
        const campaign = databaseBuilder.factory.buildCampaign({
          archivedAt: new Date(),
          ownerId: creator.id,
          multipleSendings: false,
        });
        mockLearningContent({ skills: [] });

        await databaseBuilder.commit();
        const result = await campaignReportRepository.get(campaign.id);

        expect(result).to.be.an.instanceof(CampaignReport);
        expect(result).deep.include({
          id: campaign.id,
          name: campaign.name,
          code: campaign.code,
          title: campaign.title,
          idPixLabel: campaign.idPixLabel,
          createdAt: campaign.createdAt,
          customLandingPageText: campaign.customLandingPageText,
          archivedAt: campaign.archivedAt,
          type: campaign.type,
          ownerId: campaign.ownerId,
          ownerLastName: 'White',
          ownerFirstName: 'Walter',
          multipleSendings: campaign.multipleSendings,
        });
      });
    });

    context('target profile information', function () {
      beforeEach(function () {
        const learningContent = {
          skills: [
            { id: 'skill1', tubeId: 'tube1' },
            { id: 'skill2', tubeId: 'tube1' },
            { id: 'skill3', tubeId: 'tube2' },
            { id: 'skill4', tubeId: 'tube3' },
          ],
        };

        mockLearningContent(learningContent);
        return databaseBuilder.commit();
      });

      it('returns general information about target profile', async function () {
        const targetProfile = databaseBuilder.factory.buildTargetProfile({
          name: 'Name',
          description: 'Description',
        });
        const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });

        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill2' });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill3' });

        await databaseBuilder.commit();
        const result = await campaignReportRepository.get(campaign.id);

        expect(result).deep.include({
          targetProfileId: targetProfile.id,
          targetProfileDescription: targetProfile.description,
          targetProfileName: targetProfile.name,
          targetProfileTubesCount: 2,
        });
      });

      context('Thematic Result information', function () {
        it('returns general information about thematic results', async function () {
          const creator = databaseBuilder.factory.buildUser({ firstName: 'Walter', lastName: 'White' });
          const targetProfile = databaseBuilder.factory.buildTargetProfile({
            name: 'Name',
            description: 'Description',
          });
          const campaign = databaseBuilder.factory.buildCampaign({
            targetProfileId: targetProfile.id,
            archivedAt: new Date(),
            ownerId: creator.id,
            multipleSendings: false,
          });

          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
          databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id, key: 1 });
          databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id, key: 2 });
          databaseBuilder.factory.buildBadge({ key: 3 });

          await databaseBuilder.commit();
          const result = await campaignReportRepository.get(campaign.id);

          expect(result.targetProfileThematicResultCount).to.equal(2);
        });
      });

      context('Stages information', function () {
        context('when the target profile has stages', function () {
          it('returns general information about stages', async function () {
            const targetProfile = databaseBuilder.factory.buildTargetProfile();
            const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });

            databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
            databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });

            await databaseBuilder.commit();
            const result = await campaignReportRepository.get(campaign.id);

            expect(result.targetProfileHasStage).to.equal(true);
          });
        });
        context('when the target profile has no stages', function () {
          it('returns general information about stages', async function () {
            const { id: otherTargetProfilId } = databaseBuilder.factory.buildTargetProfile();
            const campaign = databaseBuilder.factory.buildCampaign();

            databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
            databaseBuilder.factory.buildStage({ targetProfileId: otherTargetProfilId });

            await databaseBuilder.commit();
            const result = await campaignReportRepository.get(campaign.id);

            expect(result.targetProfileHasStage).to.equal(false);
          });
        });
      });
    });

    context('participations', function () {
      let campaign;
      beforeEach(function () {
        campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });

        const learningContent = { skills: [{ id: 'skill1' }] };

        mockLearningContent(learningContent);
        return databaseBuilder.commit();
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

      it('should only count non-deleted participations', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          deletedAt: '2022-03-21',
        });
        databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, deletedAt: null });
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

      it('should only count shared participations not deleted', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          sharedAt: '2022-03-21',
          status: SHARED,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          sharedAt: '2022-03-10',
          status: SHARED,
          deletedAt: '2022-03-21',
        });
        await databaseBuilder.commit();

        // when
        const result = await campaignReportRepository.get(campaign.id);

        // then
        expect(result.sharedParticipationsCount).to.equal(1);
      });

      it('should not count any shared participations when participation is deleted', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          sharedAt: '2022-03-10',
          status: SHARED,
          deletedAt: '2022-03-21',
        });

        await databaseBuilder.commit();

        // when
        const result = await campaignReportRepository.get(campaign.id);

        // then
        expect(result.sharedParticipationsCount).to.equal(0);
      });
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

  describe('#findMasteryRatesAndValidatedSkillsCount', function () {
    let campaignId;

    beforeEach(function () {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      return databaseBuilder.commit();
    });

    it('should return array with result', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, validatedSkillsCount: 18 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.3, validatedSkillsCount: 42 });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId);

      // then
      expect(result).to.be.instanceOf(Object);
      expect(result.masteryRates).to.have.members([0.1, 0.3]);
      expect(result.validatedSkillsCounts).to.have.members([18, 42]);
    });

    it('should only take into account participations not improved', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, isImproved: true });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.3, isImproved: false });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId);

      // then
      expect(result).to.deep.equal({ masteryRates: [0.3], validatedSkillsCounts: [0] });
    });

    it('should only take into account participations not deleted', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, deletedAt: null });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0.3,
        deletedAt: new Date('2019-03-06'),
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId);

      // then
      expect(result).to.deep.equal({ masteryRates: [0.1], validatedSkillsCounts: [0] });
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
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId);

      // then
      expect(result).to.deep.equal({ masteryRates: [0.1], validatedSkillsCounts: [0] });
    });

    it('should return empty array if campaign can not be found', async function () {
      // given
      const nonExistentId = 666;

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(nonExistentId);

      // then
      expect(result).to.deep.equal({ masteryRates: [], validatedSkillsCounts: [] });
    });
  });

  describe('#findPaginatedFilteredByOrganizationId', function () {
    let filter, page;
    let organizationId, targetProfileId, ownerId;
    let campaign;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      targetProfileId = databaseBuilder.factory.buildTargetProfile({ organizationId }).id;
      ownerId = databaseBuilder.factory.buildUser({}).id;
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
          ownerId,
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
            'idPixLabel',
            'title',
            'type',
            'customLandingPageText',
            'ownerId',
            'ownerLastName',
            'ownerFirstName',
            'targetProfileName',
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
          ownerId,
        });
        databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId,
          ownerId,
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

        it('should only count participations not deleted', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId });
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign.id,
            deletedAt: new Date(),
          });
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

        it('should only count shared participations not deleted', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId });
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign.id,
            sharedAt: new Date(),
            isImproved: false,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign.id,
            isImproved: false,
            sharedAt: new Date(),
            deletedAt: new Date(),
          });
          await databaseBuilder.commit();

          // when
          const { models: campaignReports } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

          // then
          expect(campaignReports[0].sharedParticipationsCount).to.equal(1);
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
        it('should return these campaigns only', async function () {
          // given
          const filter = { name: 'matH' };
          _.each([{ name: 'Maths L1' }, { name: 'Maths L2' }, { name: 'Chimie' }], (campaign) => {
            databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
          });
          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Maths L2']);
        });
      });

      context('when some campaigns owner fullname match the given ownerName searched', function () {
        it('should return the matching campaigns', async function () {
          // given
          const owner1 = databaseBuilder.factory.buildUser({ firstName: 'Robert', lastName: 'Howard' });
          const owner2 = databaseBuilder.factory.buildUser({ firstName: 'Bernard', lastName: 'Dupuy' });
          const filter = { ownerName: 'Robert H' };
          _.each(
            [
              { name: 'Maths L1', ownerId: owner1.id },
              { name: 'Maths L2', ownerId: owner2.id },
              { name: 'Chimie', ownerId: owner1.id },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );

          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Chimie']);
        });

        it('should handle space before search', async function () {
          // given
          const owner1 = databaseBuilder.factory.buildUser({ firstName: 'Robert', lastName: 'Howard' });
          const filter = { ownerName: ' ro' };
          _.each(
            [
              { name: 'Maths L1', ownerId: owner1.id },
              { name: 'Chimie', ownerId: owner1.id },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );

          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Chimie']);
        });

        it('should handle space after search', async function () {
          // given
          const owner1 = databaseBuilder.factory.buildUser({ firstName: 'Robert', lastName: 'Howard' });
          const filter = { ownerName: 'ro ' };
          _.each(
            [
              { name: 'Maths L1', ownerId: owner1.id },
              { name: 'Chimie', ownerId: owner1.id },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );

          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Chimie']);
        });
      });

      context('when some campaigns owner firstName match the given ownerName searched', function () {
        it('should return the matching campaigns', async function () {
          // given
          const owner1 = databaseBuilder.factory.buildUser({ firstName: 'Robert' });
          const owner2 = databaseBuilder.factory.buildUser({ firstName: 'Bernard' });
          const filter = { ownerName: owner1.firstName.toUpperCase() };
          _.each(
            [
              { name: 'Maths L1', ownerId: owner1.id },
              { name: 'Maths L2', ownerId: owner2.id },
              { name: 'Chimie', ownerId: owner1.id },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );

          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Chimie']);
        });
      });

      context('when some campaigns owner lastName match the given ownerName searched', function () {
        it('should return the matching campaigns', async function () {
          // given
          const owner1 = databaseBuilder.factory.buildUser({ lastName: 'Redford' });
          const owner2 = databaseBuilder.factory.buildUser({ lastName: 'Menez' });

          const filter = { ownerName: owner1.lastName.toUpperCase() };
          _.each(
            [
              { name: 'Maths L1', ownerId: owner1.id },
              { name: 'Maths L2', ownerId: owner2.id },
              { name: 'Chimie', ownerId: owner1.id },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );

          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Chimie']);
        });
      });

      context('when the given filter search property is not searchable', function () {
        it('should ignore the filter and return all campaigns', async function () {
          // given
          const filter = { code: 'FAKECODE' };
          const page = { number: 1, size: 10 };
          databaseBuilder.factory.buildCampaign({ organizationId });
          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(actualCampaignsWithReports).to.have.lengthOf(1);
        });
      });

      context('when campaigns amount exceed page size', function () {
        it('should return page size number of campaigns', async function () {
          // given
          _.times(5, () => databaseBuilder.factory.buildCampaign({ organizationId }));
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 2, rowCount: 5 };
          await databaseBuilder.commit();

          // when
          const { models: campaignsWithReports, meta: pagination } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });

          // then
          expect(campaignsWithReports).to.have.lengthOf(4);
          expect(pagination).to.include(expectedPagination);
        });
      });

      context('when user requests their campaigns', function () {
        it('should return the owner campaigns only', async function () {
          // given
          const filter = { isOwnedByMe: true };
          _.each([{ name: 'Maths L1' }, { name: 'Maths L2' }], (campaign) => {
            databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
          });
          _.each(
            [
              { name: 'Ma campagne', ownerId },
              { name: 'Ma campagne 2', ownerId },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );
          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({
              organizationId,
              filter,
              page,
              userId: ownerId,
            });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Ma campagne', 'Ma campagne 2']);
        });

        it('should return the campaigns matching the given campaign name', async function () {
          // given
          const filters = { isOwnedByMe: true, name: '2' };
          _.each([{ name: 'Maths L1' }, { name: 'Maths L2' }], (campaign) => {
            databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
          });
          _.each(
            [
              { name: 'Ma campagne', ownerId },
              { name: 'Ma campagne 2', ownerId },
            ],
            (campaign) => {
              databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
            }
          );
          await databaseBuilder.commit();

          // when
          const { models: actualCampaignsWithReports } =
            await campaignReportRepository.findPaginatedFilteredByOrganizationId({
              organizationId,
              filter: filters,
              page,
              userId: ownerId,
            });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Ma campagne 2']);
        });
      });
    });
  });
});
