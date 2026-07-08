import _ from 'lodash';

import { CampaignReport } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignReport.js';
import * as campaignReportRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-report-repository.js';
import { findMasteryRates } from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-report-repository.js';
import {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CAMPAIGN_FEATURES } from '../../../../../../src/shared/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

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
        databaseBuilder.factory.learningContent.build({ skills: [] });

        await databaseBuilder.commit();
        const result = await campaignReportRepository.get(campaign.id);

        expect(result).to.be.an.instanceof(CampaignReport);
        expect(result).deep.include({
          id: campaign.id,
          name: campaign.name,
          code: campaign.code,
          title: campaign.title,
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

      it('returns informations about campaigns and campaign features', async function () {
        const creator = databaseBuilder.factory.buildUser({ firstName: 'Walter', lastName: 'White' });
        const campaign = databaseBuilder.factory.buildCampaign({
          archivedAt: new Date(),
          ownerId: creator.id,
          multipleSendings: false,
        });
        const externalIdFeature = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID);
        databaseBuilder.factory.buildCampaignFeature({
          campaignId: campaign.id,
          featureId: externalIdFeature.id,
          params: {
            label: 'Un identifiant',
            type: CampaignExternalIdTypes.STRING,
          },
        });

        databaseBuilder.factory.learningContent.build({ skills: [] });

        await databaseBuilder.commit();
        const result = await campaignReportRepository.get(campaign.id);

        expect(result).to.be.an.instanceof(CampaignReport);
        expect(result).deep.include({
          id: campaign.id,
          name: campaign.name,
          code: campaign.code,
          title: campaign.title,
          externalIdLabel: 'Un identifiant',
          externalIdType: CampaignExternalIdTypes.STRING,
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

        databaseBuilder.factory.learningContent.build(learningContent);
        return databaseBuilder.commit();
      });

      [CampaignTypes.ASSESSMENT, CampaignTypes.EXAM].forEach((campaignType) => {
        context(`for campaign of type ${campaignType}`, function () {
          it('returns general information about target profile', async function () {
            const targetProfile = databaseBuilder.factory.buildTargetProfile({
              name: 'Name',
              description: 'Description',
            });
            const campaign = databaseBuilder.factory.buildCampaign({
              targetProfileId: targetProfile.id,
              type: campaignType,
            });

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
              targetProfileAreKnowledgeElementsResettable: false,
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
                type: campaignType,
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
                const campaign = databaseBuilder.factory.buildCampaign({
                  targetProfileId: targetProfile.id,
                  type: campaignType,
                });

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
                const campaign = databaseBuilder.factory.buildCampaign({ type: campaignType });

                databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
                databaseBuilder.factory.buildStage({ targetProfileId: otherTargetProfilId });

                await databaseBuilder.commit();
                const result = await campaignReportRepository.get(campaign.id);

                expect(result.targetProfileHasStage).to.equal(false);
              });
            });
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

        databaseBuilder.factory.learningContent.build(learningContent);
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

      it('should only count one shared participations by participant', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId });
        const userId2 = databaseBuilder.factory.buildUser().id;
        const learner2 = databaseBuilder.factory.buildOrganizationLearner({ userId: userId2 });

        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId: learner.id,
          campaignId: campaign.id,
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId: learner.id,
          campaignId: campaign.id,
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId: learner.id,
          campaignId: campaign.id,
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId: userId2,
          organizationLearnerId: learner2.id,
          campaignId: campaign.id,
        });
        await databaseBuilder.commit();

        // when
        const result = await campaignReportRepository.get(campaign.id);
        // then
        expect(result.sharedParticipationsCount).to.equal(2);
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

    it('should throw a NotFoundError if campaign is deleted', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({
        deletedAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(campaignReportRepository.get)(campaign.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe(findMasteryRates.name, function () {
    let campaignId;

    beforeEach(function () {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      return databaseBuilder.commit();
    });

    it('should return an array of mastery rates', async function () {
      // given
      const firstLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      const secondLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0.1,
        organizationLearnerId: firstLearnerId,
        sharedAt: new Date(),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0.3,
        organizationLearnerId: secondLearnerId,
        sharedAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRates(campaignId);

      // then
      expect(result).to.have.members([0.1, 0.3]);
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
      const result = await campaignReportRepository.findMasteryRates(campaignId);

      // then
      expect(result).to.have.members([0.1]);
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
      expect(result).to.have.members([0.1]);
    });

    it('should only take latest shared participations by learner', async function () {
      // given
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0.1,
        isImproved: true,
        sharedAt: new Date('2020-01-01'),
        status: SHARED,
        organizationLearnerId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0.3,
        isImproved: false,
        sharedAt: new Date('2024-09-09'),
        organizationLearnerId,
        status: SHARED,
      });

      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRates(campaignId);

      // then
      expect(result).to.have.members([0.3]);
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
    let organizationId, targetProfileId, owner, ownerId;
    let campaign;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      targetProfileId = databaseBuilder.factory.buildTargetProfile({ organizationId, name: 'targetProfileName1' }).id;
      owner = databaseBuilder.factory.buildUser({});
      ownerId = owner.id;

      await databaseBuilder.commit();

      filter = {};
      page = { number: 1, size: 4 };
    });

    context('when the given organization has deleted campaigns', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildCampaign({
          organizationId,
          deletedAt: new Date(),
          type: CampaignTypes.PROFILES_COLLECTION,
        });
        await databaseBuilder.commit();

        // when
        const { models: campaignsWithReports, meta } =
          await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

        // then
        expect(campaignsWithReports.length).to.deep.equal(0);
        expect(meta.hasCampaigns).to.equal(false);
      });

      it('should return one campaign', async function () {
        // given
        databaseBuilder.factory.buildCampaign({
          organizationId,
          deletedAt: new Date(),
          type: CampaignTypes.ASSESSMENT,
        });
        databaseBuilder.factory.buildCampaign({ organizationId, type: CampaignTypes.PROFILES_COLLECTION });
        await databaseBuilder.commit();

        // when
        const { models: campaignsWithReports, meta } =
          await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

        // then
        expect(campaignsWithReports.length).to.deep.equal(1);
        expect(meta.hasCampaigns).to.equal(true);
      });
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
        databaseBuilder.factory.buildUser({ firstName: 'Walter', lastName: 'White' });

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
        expect(campaignsWithReports[0]).to.deep.include({
          id: campaign.id,
          name: campaign.name,
          code: campaign.code,
          createdAt: campaign.createdAt,
          archivedAt: campaign.archivedAt,
          type: campaign.type,
          ownerId: campaign.ownerId,
          ownerLastName: owner.lastName,
          ownerFirstName: owner.firstName,
          participationsCount: 0,
          sharedParticipationsCount: 0,
          targetProfileName: 'targetProfileName1',
        });
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
            },
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

      context('when there is both ongoing and archived campaign', function () {
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

        it('should be able to retrieve only ongoing campaigns by default', async function () {
          // given
          organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildCampaign({
            organizationId,
            archivedAt: new Date('2010-07-30T09:35:45Z'),
          });
          const ongoingCampaign = databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: null });
          filter = {};

          await databaseBuilder.commit();
          // when
          const { models: campaigns } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter,
            page,
          });

          // then
          expect(campaigns).to.have.lengthOf(1);
          expect(campaigns[0].id).to.equal(ongoingCampaign.id);
          expect(campaigns[0].archivedAt).to.deep.equal(ongoingCampaign.archivedAt);
        });

        it('should be able to return all campaigns', async function () {
          // given
          organizationId = databaseBuilder.factory.buildOrganization().id;
          const archivedCampaign = databaseBuilder.factory.buildCampaign({
            organizationId,
            createdAt: new Date('2010-07-01T09:35:45Z'),
            archivedAt: new Date('2010-07-30T09:35:45Z'),
          });
          const ongoingCampaign = databaseBuilder.factory.buildCampaign({
            organizationId,
            createdAt: new Date('2012-07-01T09:35:45Z'),
            archivedAt: null,
          });
          filter.ongoing = false;

          await databaseBuilder.commit();
          // when
          const { models: campaigns } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
            organizationId,
            filter: undefined,
            page,
          });

          // then
          expect(campaigns).to.have.lengthOf(2);
          expect(campaigns[0].id).to.equal(ongoingCampaign.id);
          expect(campaigns[0].archivedAt).to.deep.equal(ongoingCampaign.archivedAt);
          expect(campaigns[1].id).to.equal(archivedCampaign.id);
          expect(campaigns[1].archivedAt).to.deep.equal(archivedCampaign.archivedAt);
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
            },
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
            },
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
            },
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
            },
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
            },
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
            },
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
            },
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

    context('when campaigns are related to combine course', function () {
      it('should not return campaigns belonging to a combined course', async function () {
        // given
        const campaignInQuest = databaseBuilder.factory.buildCampaign({ organizationId });
        const campaignNotInQuest = databaseBuilder.factory.buildCampaign({ organizationId });
        const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
          successRequirements: [
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaignInQuest.id }).toDTO(),
          ],
        });
        databaseBuilder.factory.buildCombinedCourse({
          code: 'ABCDE1234',
          name: 'Mon parcours Combiné',
          organizationId,
          questId,
        });
        await databaseBuilder.commit();

        // when
        const { models } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
          organizationId,
          filter,
          page,
        });

        // then
        expect(models).lengthOf(1);
        expect(models[0].id).equal(campaignNotInQuest.id);
      });
      it('should return empty campaigns and hasCampaigns to false', async function () {
        // given
        const campaignInQuest = databaseBuilder.factory.buildCampaign({ organizationId });
        const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
          successRequirements: [
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaignInQuest.id }).toDTO(),
          ],
        });
        databaseBuilder.factory.buildCombinedCourse({
          code: 'ABCDE1234',
          name: 'Mon parcours Combiné',
          organizationId,
          questId,
        });
        await databaseBuilder.commit();

        // when
        const { models, meta } = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
          organizationId,
          filter,
          page,
        });

        // then
        expect(models).lengthOf(0);
        expect(meta.hasCampaigns).false;
      });
    });
  });

  describe('#findAllPaginatedSummariesByOrganizationId', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      await databaseBuilder.commit();
    });

    it('should return a lightweight paginated list ordered by createdAt DESC', async function () {
      // given
      const oldest = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Oldest',
        createdAt: new Date('2020-01-01'),
        archivedAt: new Date('2020-03-01'),
      });
      const newest = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Newest',
        createdAt: new Date('2023-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const { models, meta } = await campaignReportRepository.findAllPaginatedSummariesByOrganizationId({
        organizationId,
        page: { number: 1, size: 10 },
      });

      // then
      expect(models.map(({ id }) => id)).to.deep.equal([newest.id, oldest.id]);
      expect(models[0]).to.have.all.keys('id', 'name', 'code', 'type', 'createdAt', 'archivedAt');
      expect(meta).to.deep.equal({ page: 1, pageCount: 1, pageSize: 10, rowCount: 2 });
    });

    it('should exclude deleted campaigns', async function () {
      // given
      databaseBuilder.factory.buildCampaign({ organizationId, deletedAt: new Date() });
      const kept = databaseBuilder.factory.buildCampaign({ organizationId });
      await databaseBuilder.commit();

      // when
      const { models, meta } = await campaignReportRepository.findAllPaginatedSummariesByOrganizationId({
        organizationId,
        withTargetProfileName: false,
        page: { number: 1, size: 10 },
      });

      // then
      expect(models.map(({ id }) => id)).to.deep.equal([kept.id]);
      expect(meta.rowCount).to.equal(1);
    });

    describe('when withTargetProfileName is true', function () {
      it('should return targetProfileName for campaigns with a target profile', async function () {
        // given
        const oldest = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'Oldest',
          createdAt: new Date('2020-01-01'),
          targetProfileId: null,
        });
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const newest = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'Newest',
          createdAt: new Date('2023-01-01'),
          targetProfileId: targetProfile.id,
        });
        await databaseBuilder.commit();

        // when
        const { models, meta } = await campaignReportRepository.findAllPaginatedSummariesByOrganizationId({
          organizationId,
          withTargetProfileName: true,
          page: { number: 1, size: 10 },
        });

        // then
        expect(models).to.deep.equal([
          {
            id: newest.id,
            name: newest.name,
            code: newest.code,
            type: newest.type,
            createdAt: newest.createdAt,
            archivedAt: newest.archivedAt,
            targetProfileName: targetProfile.name,
          },
          {
            id: oldest.id,
            name: oldest.name,
            code: oldest.code,
            type: oldest.type,
            createdAt: oldest.createdAt,
            archivedAt: oldest.archivedAt,
            targetProfileName: null,
          },
        ]);
        expect(meta).to.deep.equal({ page: 1, pageCount: 1, pageSize: 10, rowCount: 2 });
      });
    });

    describe('when withArchived is false', function () {
      it('should not return archived campaigns', async function () {
        // given
        databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'Oldest',
          createdAt: new Date('2020-01-01'),
          targetProfileId: null,
        });
        const archived = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'Archived',
          createdAt: new Date('2022-01-01'),
          archivedAt: new Date('2022-03-01'),
        });
        databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'Newest',
          createdAt: new Date('2023-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const { models, meta } = await campaignReportRepository.findAllPaginatedSummariesByOrganizationId({
          organizationId,
          withArchived: false,
          page: { number: 1, size: 10 },
        });

        // then
        expect(models.length).to.equal(2);
        expect(models.find(({ id }) => id === archived.id)).to.be.undefined;
        expect(meta).to.deep.equal({
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 2,
        });
      });
    });
  });
});
