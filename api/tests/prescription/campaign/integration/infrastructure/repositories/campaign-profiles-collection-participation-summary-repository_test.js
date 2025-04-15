import { CampaignProfilesCollectionParticipationSummary } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignProfilesCollectionParticipationSummary.js';
import * as campaignProfilesCollectionParticipationSummaryRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

const { STARTED, TO_SHARE, SHARED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Profiles Collection Participation Summary repository', function () {
  describe('#findPaginatedByCampaignId', function () {
    let campaignId, organizationId, organizationLearner;
    let competences;
    let skills;
    const sharedAt = new Date('2018-05-06');

    beforeEach(async function () {
      const learningContentData = buildLearningContentData();
      competences = learningContentData.competences;
      skills = learningContentData.skills;

      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

      await databaseBuilder.commit();
    });

    it('should return empty array if no participant', async function () {
      // when
      const results =
        await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

      // then
      expect(results.data).to.have.lengthOf(0);
    });

    it('should not return participant data summary for a not shared campaign participation', async function () {
      // given
      const campaignParticipation = {
        campaignId,
        status: STARTED,
        sharedAt: null,
        organizationLearnerId: organizationLearner.id,
      };
      databaseBuilder.factory.buildCampaignParticipationWithUser({}, campaignParticipation, false);
      await databaseBuilder.commit();

      // when
      const results =
        await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

      // then
      expect(results.data).to.deep.equal([]);
    });

    it('should return participants data summary only for the given campaign id', async function () {
      // given
      const campaignParticipation1 = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Lise', lastName: 'Quesnel' },
        campaignParticipation1,
        false,
      );
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipation2 = { campaignId: campaignId2 };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Benjamin', lastName: 'Petetot' },
        campaignParticipation2,
        false,
      );
      await databaseBuilder.commit();

      // when
      const results =
        await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Lise']);
    });

    it('should return participants data summary ordered by last name then first name asc from organization-learner', async function () {
      // given
      const campaignParticipation = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Jaja', lastName: 'Le raplapla', organizationId },
        campaignParticipation,
        false,
      );
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Jiji', lastName: 'Le riquiqui', organizationId },
        campaignParticipation,
        false,
      );
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Jojo', lastName: 'Le rococo', organizationId },
        campaignParticipation,
        false,
      );
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Juju', lastName: 'Le riquiqui', organizationId },
        campaignParticipation,
        false,
      );
      await databaseBuilder.commit();

      // when
      const results =
        await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Jaja', 'Jiji', 'Juju', 'Jojo']);
    });

    describe('when there is a participation deleted', function () {
      it('does not return deleted participation', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const participationData = {
          campaignId,
          isShared: true,
          sharedAt,
          participantExternalId: 'JeBu',
          pixScore: 46,
          deletedAt: new Date('2020-03-30'),
          deletedBy: userId,
        };
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner({}, participationData, false);

        await databaseBuilder.commit();

        const results =
          await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

        expect(results.data).to.be.empty;
      });
    });

    describe('when a participant has shared the participation to the campaign', function () {
      let campaignParticipation;

      beforeEach(async function () {
        const createdAt = new Date('2018-04-06T10:00:00Z');
        const participationData = { campaignId, isShared: true, sharedAt, participantExternalId: 'JeBu', pixScore: 46 };
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'Jérémy', lastName: 'bugietta', organizationId },
          participationData,
          false,
        );

        const ke1 = databaseBuilder.factory.buildKnowledgeElement({
          status: 'validated',
          competenceId: competences[0].id,
          skillId: skills[0].id,
          earnedPix: 40,
          userId: campaignParticipation.userId,
          createdAt,
        });

        const ke2 = databaseBuilder.factory.buildKnowledgeElement({
          status: 'validated',
          competenceId: competences[1].id,
          skillId: skills[2].id,
          earnedPix: 6,
          userId: campaignParticipation.userId,
          createdAt,
        });

        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: campaignParticipation.id,
          snapshot: new KnowledgeElementCollection([ke1, ke2]).toSnapshot(),
        });

        await databaseBuilder.commit();
      });

      it('should return the certification profile info, pix score and count', async function () {
        // when
        const results =
          await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

        // then
        expect(results.data).to.deep.equal([
          new CampaignProfilesCollectionParticipationSummary({
            campaignParticipationId: campaignParticipation.id,
            firstName: 'Jérémy',
            lastName: 'bugietta',
            participantExternalId: 'JeBu',
            sharedAt,
            pixScore: 46,
            sharedProfileCount: 1,
            certifiable: false,
            certifiableCompetencesCount: 1,
          }),
        ]);
      });
    });

    describe('when a participant has participated twice', function () {
      let recentCampaignParticipation, oldCampaignParticipation;

      beforeEach(async function () {
        oldCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          sharedAt: new Date('2020-01-02'),
          createdAt: new Date('2020-01-02'),
          isImproved: true,
          userId: organizationLearner.userId,
          organizationLearnerId: organizationLearner.id,
        });

        await databaseBuilder.commit();
      });

      it('should return only the latest shared participationCampaign', async function () {
        //given
        recentCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          isImproved: false,
          sharedAt: new Date('2022-01-02'),
          createdAt: new Date('2022-01-02'),
          campaignId,
          userId: organizationLearner.userId,
          organizationLearnerId: organizationLearner.id,
        });

        await databaseBuilder.commit();

        // when
        const results =
          await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

        // then
        expect(results.data).to.have.lengthOf(1);
        expect(results.data[0].id).to.equal(recentCampaignParticipation.id);
      });

      it('should return only the shared participation', async function () {
        //given
        recentCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          isImproved: false,
          sharedAt: null,
          createdAt: new Date('2022-01-02'),
          status: TO_SHARE,
          campaignId,
          userId: organizationLearner.userId,
          organizationLearnerId: organizationLearner.id,
        });

        await databaseBuilder.commit();

        // when
        const results =
          await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

        // then
        expect(results.data).to.have.lengthOf(1);
        expect(results.data[0].id).to.equal(oldCampaignParticipation.id);
      });
    });

    context('participations count', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          sharedAt: new Date('2020-01-02'),
          createdAt: new Date('2020-01-02'),
          isImproved: true,
          userId: organizationLearner.userId,
          organizationLearnerId: organizationLearner.id,
        });

        await databaseBuilder.commit();
      });

      describe('when participant has only one shared participation', function () {
        it('should count one participation', async function () {
          // when
          const results =
            await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

          // then
          expect(results.data[0].sharedProfileCount).to.equal(1);
        });
      });
      describe('when participant has multiple participations', function () {
        it('should return the count of shared participations only', async function () {
          // given
          databaseBuilder.factory.buildCampaignParticipation({
            isImproved: true,
            sharedAt: new Date('2022-01-02'),
            createdAt: new Date('2022-01-02'),
            status: SHARED,
            campaignId,
            userId: organizationLearner.userId,
            organizationLearnerId: organizationLearner.id,
          });

          databaseBuilder.factory.buildCampaignParticipation({
            isImproved: false,
            sharedAt: null,
            createdAt: new Date('2022-01-02'),
            status: TO_SHARE,
            campaignId,
            userId: organizationLearner.userId,
            organizationLearnerId: organizationLearner.id,
          });

          await databaseBuilder.commit();

          // when
          const results =
            await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

          // then
          expect(results.data[0].sharedProfileCount).to.equal(2);
        });

        it('should not count a deleted participation', async function () {
          // given deleted participation
          databaseBuilder.factory.buildCampaignParticipation({
            isImproved: true,
            sharedAt: new Date('2022-01-02'),
            createdAt: new Date('2022-01-02'),
            deletedAt: new Date('2022-01-02'),
            status: SHARED,
            campaignId,
            userId: organizationLearner.userId,
            organizationLearnerId: organizationLearner.id,
          });

          // given not shared participation
          databaseBuilder.factory.buildCampaignParticipation({
            isImproved: false,
            sharedAt: null,
            createdAt: new Date('2022-01-02'),
            status: TO_SHARE,
            campaignId,
            userId: organizationLearner.userId,
            organizationLearnerId: organizationLearner.id,
          });

          await databaseBuilder.commit();

          // when
          const results =
            await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

          // then
          expect(results.data[0].sharedProfileCount).to.equal(1);
        });
      });

      describe('when there is another participant for same campaign', function () {
        it('should only count shared participations for same learner', async function () {
          // given second organisation learner and his participation
          const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
          databaseBuilder.factory.buildCampaignParticipation({
            isImproved: false,
            sharedAt: new Date('2022-01-02'),
            createdAt: new Date('2022-01-02'),
            status: SHARED,
            campaignId,
            userId: secondOrganizationLearner.userId,
            organizationLearnerId: secondOrganizationLearner.id,
          });

          await databaseBuilder.commit();

          // when
          const results =
            await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

          // then
          expect(results.data[0].sharedProfileCount).to.equal(1);
          expect(results.data[1].sharedProfileCount).to.equal(1);
        });
      });

      describe('when participant has participations to different campaigns', function () {
        it('should only count shared participations for same campaign', async function () {
          // given second campaign and participation
          const secondCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

          databaseBuilder.factory.buildCampaignParticipation({
            isImproved: false,
            sharedAt: new Date('2022-01-02'),
            createdAt: new Date('2022-01-02'),
            status: SHARED,
            campaignId: secondCampaignId,
            userId: organizationLearner.userId,
            organizationLearnerId: organizationLearner.id,
          });

          await databaseBuilder.commit();

          // when
          const results =
            await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

          // then
          expect(results.data[0].sharedProfileCount).to.equal(1);
        });
      });
    });

    context('evolution', function () {
      let userId,
        organizationId,
        organizationLearnerId,
        campaign,
        recentParticipationPixScore,
        recentParticipationSharedAt;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser({}).id;

        organizationId = databaseBuilder.factory.buildOrganization().id;

        organizationLearnerId = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          firstName: 'Sarah',
          lastName: 'Croche',
          organizationId,
          userId,
        }).id;

        campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.PROFILES_COLLECTION,
          organizationId,
          multipleSendings: true,
        });

        recentParticipationPixScore = 40;
        recentParticipationSharedAt = new Date('2024-01-06');

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          organizationLearnerId,
          pixScore: recentParticipationPixScore,
          isImproved: true,
          createdAt: new Date('2024-01-05'),
          sharedAt: recentParticipationSharedAt,
          status: SHARED,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          organizationLearnerId,
          pixScore: null,
          isImproved: false,
          createdAt: new Date('2024-01-07'),
          sharedAt: null,
          status: TO_SHARE,
        });

        await databaseBuilder.commit();
      });

      describe('when participant has only one shared participation, and the other is not shared', function () {
        it('should return null for evolution', async function () {
          // when
          const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
            campaign.id,
          );

          // then
          expect(results.data[0]).to.deep.include({
            pixScore: recentParticipationPixScore,
            evolution: null,
          });
        });
      });

      describe('when participant has 2 shared participation', function () {
        const previousParticipationPixScore = 20;
        const previousParticipationSharedAt = new Date('2024-01-04');

        it('should return correct evolution', async function () {
          // given
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId,
            organizationLearnerId,
            pixScore: previousParticipationPixScore,
            isImproved: true,
            createdAt: new Date('2024-01-03'),
            sharedAt: previousParticipationSharedAt,
            status: SHARED,
          });

          await databaseBuilder.commit();

          // when
          const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
            campaign.id,
          );

          // then
          expect(results.data[0]).to.deep.include({
            pixScore: recentParticipationPixScore,
            evolution: 'increase',
          });
        });

        it('should return null for evolution when previous participation is deleted', async function () {
          // given
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId,
            organizationLearnerId,
            pixScore: previousParticipationPixScore,
            isImproved: true,
            createdAt: new Date('2024-01-03'),
            sharedAt: previousParticipationSharedAt,
            deletedAt: new Date('2024-01-05'),
            status: SHARED,
          });

          await databaseBuilder.commit();

          // when
          const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
            campaign.id,
          );

          // then
          expect(results.data[0]).to.deep.include({
            pixScore: recentParticipationPixScore,
            evolution: null,
          });
        });

        it('should return null for evolution when learner has 2 participations to different campaigns', async function () {
          // given
          const otherCampaign = databaseBuilder.factory.buildCampaign({
            type: CampaignTypes.PROFILES_COLLECTION,
            organizationId,
            multipleSendings: true,
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: otherCampaign.id,
            userId,
            organizationLearnerId,
            pixScore: previousParticipationPixScore,
            isImproved: true,
            createdAt: new Date('2024-01-03'),
            sharedAt: previousParticipationSharedAt,
            status: SHARED,
          });

          await databaseBuilder.commit();

          // when
          const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
            campaign.id,
          );

          // then
          expect(results.data[0]).to.deep.include({
            pixScore: recentParticipationPixScore,
            evolution: null,
          });
        });

        it('should return null for evolution when participations are from different learners', async function () {
          // given
          const otherUserId = databaseBuilder.factory.buildUser({}).id;

          const otherOrganizationLearnerId =
            databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: 'Martin',
              lastName: 'Sapin',
              organizationId,
              otherUserId,
            }).id;

          const otherOrganizationLearnerParticipation = databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId: otherUserId,
            organizationLearnerId: otherOrganizationLearnerId,
            pixScore: 0,
            isImproved: false,
            createdAt: new Date('2024-01-03'),
            sharedAt: new Date('2024-01-04'),
            status: SHARED,
          });

          await databaseBuilder.commit();

          // when
          const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
            campaign.id,
          );

          // then
          expect(results.data[0]).to.deep.include({
            pixScore: recentParticipationPixScore,
            evolution: null,
          });

          expect(results.data[1]).to.deep.include({
            pixScore: otherOrganizationLearnerParticipation.pixScore,
            evolution: null,
          });
        });
      });

      describe('when participant has a third shared participation', function () {
        it('should return correct evolution, comparing recent and previous, ignoring old', async function () {
          const oldParticipationPixScore = 20;
          const oldParticipationSharedAt = new Date('2024-01-02');

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId,
            organizationLearnerId,
            pixScore: oldParticipationPixScore,
            isImproved: true,
            createdAt: new Date('2024-01-01'),
            sharedAt: oldParticipationSharedAt,
            status: SHARED,
          });

          await databaseBuilder.commit();

          const previousParticipationPixScore = 60;
          const previousParticipationSharedAt = new Date('2024-01-04');

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId,
            organizationLearnerId,
            pixScore: previousParticipationPixScore,
            isImproved: true,
            createdAt: new Date('2024-01-03'),
            sharedAt: previousParticipationSharedAt,
            status: SHARED,
          });

          await databaseBuilder.commit();

          // when
          const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
            campaign.id,
          );

          // then
          expect(results.data[0]).to.deep.include({
            pixScore: recentParticipationPixScore,
            evolution: 'decrease',
          });
        });
      });
    });

    describe('when there is a filter on division', function () {
      beforeEach(async function () {
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          division: 'Barry',
        });
        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          division: 'White',
        });
        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        const { id: organizationLearnerId3 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          division: 'Marvin Gaye',
        });
        const participation3 = {
          participantExternalId: "Ain't No Mountain High Enough",
          campaignId,
          organizationLearnerId: organizationLearnerId3,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation3);

        await databaseBuilder.commit();
      });

      it('returns participations which have the correct division', async function () {
        // when
        const divisions = ['Barry', 'White'];
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { divisions },
        );
        const participantExternalIds = results.data.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain([
          "Can't get Enough Of Your Love, Baby",
          "You're The First, The last, My Everything",
        ]);
      });
    });

    describe('when there is a filter on group', function () {
      beforeEach(async function () {
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
        });
        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
        });
        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        const { id: organizationLearnerId3 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Marvin Gaye',
        });
        const participation3 = {
          participantExternalId: "Ain't No Mountain High Enough",
          campaignId,
          organizationLearnerId: organizationLearnerId3,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation3);

        await databaseBuilder.commit();
      });

      it('returns participations which have the correct group', async function () {
        // when
        const groups = ['Barry', 'White'];
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { groups },
        );
        const participantExternalIds = results.data.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain([
          "Can't get Enough Of Your Love, Baby",
          "You're The First, The last, My Everything",
        ]);
      });
    });

    describe('when there is a filter on the firstname and lastname', function () {
      it('returns all participants if the filter is empty', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: '' },
        );

        // then
        expect(results.data).to.have.lengthOf(2);
      });

      it('returns Laa-Laa when we search part of its firstname', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: 'La' },
        );

        // then
        expect(results.data).to.have.lengthOf(1);
        expect(results.data[0].firstName).to.equal('Laa-Laa');
      });

      it('returns Laa-Laa when we search part of its firstname with a space before', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: ' La' },
        );

        // then
        expect(results.data).to.have.lengthOf(1);
        expect(results.data[0].firstName).to.equal('Laa-Laa');
      });

      it('returns Laa-Laa when we search part of its firstname with a space after', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: 'La ' },
        );

        // then
        expect(results.data).to.have.lengthOf(1);
        expect(results.data[0].firstName).to.equal('Laa-Laa');
      });

      it('returns Laa-Laa when we search part of its fullname', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: 'Laa-Laa Tel' },
        );

        // then
        expect(results.data).to.have.lengthOf(1);
        expect(results.data[0].firstName).to.equal('Laa-Laa');
      });

      it('returns Laa-Laa when we search similar part of lastname', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });
        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);
        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });
        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);
        const { id: organizationLearnerId3 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Maya',
          lastName: 'L abeille',
        });
        const participation3 = {
          participantExternalId: "Ain't No Mountain High Enough",
          campaignId,
          organizationLearnerId: organizationLearnerId3,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation3);
        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: 'Teletub' },
        );

        // then
        expect(results.data).to.have.lengthOf(2);
        expect(results.data[0].firstName).to.equal('Dipsy');
        expect(results.data[1].firstName).to.equal('Laa-Laa');
      });
    });

    describe('when there is a filter on certificability', function () {
      it('returns certifiable participants', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId },
          { participantExternalId: 'Certifiable', campaignId, isCertifiable: true },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId },
          { participantExternalId: 'Not certifiable', campaignId, isCertifiable: false },
        );

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { certificability: true },
        );

        const participantExternalIds = results.data.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.deep.equal(['Certifiable']);
      });

      it('returns not certifiable participants', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId },
          { participantExternalId: 'Certifiable', campaignId, isCertifiable: true },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId },
          { participantExternalId: 'Not certifiable', campaignId, isCertifiable: false },
        );

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { certificability: false },
        );

        const participantExternalIds = results.data.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.deep.equal(['Not certifiable']);
      });
    });
  });
});

const buildLearningContentData = () => {
  const skillWeb1 = { id: 'recSkillWeb1', name: '@web1', competenceId: 'recCompetence1', status: 'actif' };
  const skillWeb2 = { id: 'recSkillWeb2', name: '@web2', competenceId: 'recCompetence1', status: 'actif' };
  const skillUrl1 = { id: 'recSkillUrl1', name: '@url1', competenceId: 'recCompetence2', status: 'actif' };
  const skillUrl8 = { id: 'recSkillUrl8', name: '@url8', competenceId: 'recCompetence2', status: 'actif' };
  const skills = [skillWeb1, skillWeb2, skillUrl1, skillUrl8];

  const competence1 = {
    id: 'recCompetence1',
    name_i18n: {
      fr: 'Competence1',
    },
    index: '1.1',
    areaId: 'recArea1',
    skillIds: [skillWeb1.id, skillWeb2.id],
    origin: 'Pix',
  };

  const competence2 = {
    id: 'recCompetence2',
    name_i18n: {
      fr: 'Competence2',
    },
    index: '3.2',
    areaId: 'recArea3',
    skillIds: [skillUrl1.id, skillUrl8.id],
    origin: 'Pix',
  };

  const competences = [competence1, competence2];

  const area1 = { id: 'recArea1', code: '1', title_i18n: { fr: 'Domain 1' }, competenceIds: ['recCompetence1'] };
  const area3 = { id: 'recArea3', code: '3', title_i18n: { fr: 'Domain 3' }, competenceIds: ['recCompetence2'] };

  const learningContent = {
    areas: [area1, area3],
    competences,
    skills,
  };

  databaseBuilder.factory.learningContent.build(learningContent);

  return { competences, skills };
};
