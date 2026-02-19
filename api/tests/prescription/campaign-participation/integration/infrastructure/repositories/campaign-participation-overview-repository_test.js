import _ from 'lodash';

import * as campaignParticipationOverviewRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-overview-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { constants } from '../../../../../../src/shared/domain/constants.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import {
  databaseBuilder,
  expect,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../../../test-helper.js';

const { campaignParticipationOverviewFactory } = databaseBuilder.factory;

let userId;

describe('Integration | Repository | Campaign Participation Overview', function () {
  let targetProfile;

  beforeEach(async function () {
    sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

    userId = databaseBuilder.factory.buildUser().id;
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recCompetence1',
            tubes: [
              {
                id: 'recTube1',
                skills: [
                  {
                    id: 'recSkillId1',
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    await mockLearningContent(learningContentObjects);
    targetProfile = databaseBuilder.factory.buildTargetProfile();
    databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });
    await databaseBuilder.commit();
  });

  describe('#findByOrganizationLearnerId', function () {
    it('retrieves information about campaign participation, campaign and organization', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        title: 'Campaign ABCD',
        name: 'Campaign Name DEF',
        code: 'ABCD',
        organizationId,
        targetProfileId: targetProfile.id,
      });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId }).id;
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
        userId,
        campaignId,
        createdAt: new Date('2020-01-01'),
        sharedAt: new Date('2020-01-02'),
        validatedSkillsCount: 1,
        status: CampaignParticipationStatuses.SHARED,
        masteryRate: 0.1,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationId,
        state: Assessment.states.COMPLETED,
      });
      await databaseBuilder.commit();

      const [campaignParticipation] = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
        organizationLearnerId,
      });

      expect(campaignParticipation).to.deep.include({
        id: participationId,
        createdAt: new Date('2020-01-01'),
        sharedAt: new Date('2020-01-02'),
        isShared: true,
        campaignCode: 'ABCD',
        campaignTitle: 'Campaign ABCD',
        campaignName: 'Campaign Name DEF',
        organizationName: 'Organization ABCD',
        masteryRate: 0.1,
        totalStagesCount: undefined,
        validatedStagesCount: undefined,
        status: 'SHARED',
      });
    });

    it('should retrieve all campaign participation of the organization learner', async function () {
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner({
        userId,
      });
      const { id: otherOrganizationLearnerId, organizationId: otherOrganizationId } =
        databaseBuilder.factory.buildOrganizationLearner({ userId });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile.id,
        organizationId,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign1Id, skillId: 'recSkillId1' });
      const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile.id,
        organizationId,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign2Id, skillId: 'recSkillId1' });
      const { id: campaign3Id } = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile.id,
        organizationId: otherOrganizationId,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign3Id, skillId: 'recSkillId1' });
      const { id: participation1Id } = campaignParticipationOverviewFactory.build({
        userId,
        organizationLearnerId,
        campaignId: campaign1Id,
      });
      const { id: participation2Id } = campaignParticipationOverviewFactory.build({
        userId,
        organizationLearnerId,
        campaignId: campaign2Id,
      });
      campaignParticipationOverviewFactory.build({
        userId,
        organizationLearnerId: otherOrganizationLearnerId,
        campaignId: campaign3Id,
      });
      await databaseBuilder.commit();

      const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
        organizationLearnerId,
      });
      const campaignParticipationUserIds = _.map(campaignParticipationOverviews, 'id');

      expect(campaignParticipationUserIds).to.exactlyContain([participation1Id, participation2Id]);
    });

    it('should retrieve only campaign participation linked to ASSESSMENT', async function () {
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner({
        userId,
      });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile.id,
        organizationId,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign1Id, skillId: 'recSkillId1' });
      const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.PROFILES_COLLECTION,
        organizationId,
      });
      const { id: participation1Id } = campaignParticipationOverviewFactory.build({
        userId,
        organizationLearnerId,
        campaignId: campaign1Id,
      });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign2Id });

      await databaseBuilder.commit();

      const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
        organizationLearnerId,
      });

      expect(campaignParticipationOverviews.length).to.equal(1);
      expect(campaignParticipationOverviews[0].id).to.equal(participation1Id);
    });

    it('retrieves information about the most recent campaign participation of multipleSending campaign', async function () {
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner({
        userId,
      });
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile.id,
        organizationId,
        multipleSendings: true,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      const { id: oldParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        organizationLearnerId,
        campaignId,
        isImproved: true,
      });
      const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        organizationLearnerId,
        campaignId,
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: oldParticipationId,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participationId,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2020-01-03'),
      });
      await databaseBuilder.commit();

      const [campaignParticipation] = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
        organizationLearnerId,
      });

      expect(campaignParticipation.id).to.equal(participationId);
    });

    it('retrieves information about the most recent assessment of campaign participation', async function () {
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner({
        userId,
      });
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile.id,
        organizationId,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        organizationLearnerId,
        campaignId,
        status: CampaignParticipationStatuses.TO_SHARE,
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participationId,
        state: Assessment.states.ABORTED,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participationId,
        state: Assessment.states.STARTED,
        createdAt: new Date('2020-01-02'),
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participationId,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2020-01-03'),
      });
      await databaseBuilder.commit();

      const [campaignParticipation] = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
        organizationLearnerId,
      });

      expect(campaignParticipation.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
    });

    it('retrieves the delete date', async function () {
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner({
        userId,
      });
      const deletedAt = new Date('2022-03-05');
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        organizationLearnerId,
        campaignId,
        status: CampaignParticipationStatuses.TO_SHARE,
        deletedAt,
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participationId,
        state: Assessment.states.ABORTED,
      });
      await databaseBuilder.commit();

      const [campaignParticipation] = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
        organizationLearnerId,
      });

      expect(campaignParticipation.disabledAt).to.deep.equal(deletedAt);
    });

    it('retrieves archived date', async function () {
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner({
        userId,
      });
      const archivedAt = new Date('2020-05-26T09:54:00Z');
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile.id,
        organizationId,
        archivedAt,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        organizationLearnerId,
        campaignId,
        status: CampaignParticipationStatuses.TO_SHARE,
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participationId,
        state: Assessment.states.ABORTED,
      });
      await databaseBuilder.commit();

      const [campaignParticipation] = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
        organizationLearnerId,
      });

      expect(campaignParticipation.disabledAt).to.deep.equal(archivedAt);
    });
  });

  describe('#findByUserIdWithFilters', function () {
    context('when there is no filter', function () {
      it('retrieves information about campaign participation, campaign and organization', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          title: 'Campaign ABCD',
          name: 'Campaign Name DEF',
          code: 'ABCD',
          organizationId,
          targetProfileId: targetProfile.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          createdAt: new Date('2020-01-01'),
          sharedAt: new Date('2020-01-02'),
          validatedSkillsCount: 1,
          status: CampaignParticipationStatuses.SHARED,
          masteryRate: 0.1,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        const [campaignParticipation] = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        expect(campaignParticipation).to.deep.include({
          id: participationId,
          createdAt: new Date('2020-01-01'),
          sharedAt: new Date('2020-01-02'),
          isShared: true,
          campaignCode: 'ABCD',
          campaignTitle: 'Campaign ABCD',
          campaignName: 'Campaign Name DEF',
          organizationName: 'Organization ABCD',
          masteryRate: 0.1,
          totalStagesCount: undefined,
          validatedStagesCount: undefined,
          status: 'SHARED',
        });
      });

      it('should retrieve all campaign participation of the user', async function () {
        const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign1Id, skillId: 'recSkillId1' });
        const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign2Id, skillId: 'recSkillId1' });
        const { id: participation1Id } = campaignParticipationOverviewFactory.build({
          userId,
          campaignId: campaign1Id,
        });
        const { id: participation2Id } = campaignParticipationOverviewFactory.build({
          userId,
          campaignId: campaign2Id,
        });
        campaignParticipationOverviewFactory.build();
        await databaseBuilder.commit();

        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });
        const campaignParticipationUserIds = _.map(campaignParticipationOverviews, 'id');

        expect(campaignParticipationUserIds).to.exactlyContain([participation1Id, participation2Id]);
      });

      it('should retrieve only campaign participation linked to ASSESSMENT', async function () {
        const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign1Id, skillId: 'recSkillId1' });
        const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign2Id, skillId: 'recSkillId1' });
        const { id: campaign3Id } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
        const { id: participation1Id } = campaignParticipationOverviewFactory.build({
          userId,
          campaignId: campaign1Id,
        });
        const { id: participation2Id } = campaignParticipationOverviewFactory.build({
          userId,
          campaignId: campaign2Id,
        });
        databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign3Id });

        await databaseBuilder.commit();

        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });
        const campaignParticipationUserIds = _.map(campaignParticipationOverviews, 'id');

        expect(campaignParticipationUserIds).to.exactlyContain([participation1Id, participation2Id]);
      });

      it('retrieves information about the most recent campaign participation of multipleSending campaign', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
          multipleSendings: true,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: oldParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          isImproved: true,
        });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: oldParticipationId,
          state: Assessment.states.COMPLETED,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
          createdAt: new Date('2020-01-03'),
        });
        await databaseBuilder.commit();

        const [campaignParticipation] = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        expect(campaignParticipation.id).to.equal(participationId);
      });

      it('retrieves information about the most recent assessment of campaign participation', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          status: CampaignParticipationStatuses.TO_SHARE,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.ABORTED,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.STARTED,
          createdAt: new Date('2020-01-02'),
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
          createdAt: new Date('2020-01-03'),
        });
        await databaseBuilder.commit();

        const [campaignParticipation] = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        expect(campaignParticipation.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
      });

      it('retrieves the delete date', async function () {
        const deletedAt = new Date('2022-03-05');
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          status: CampaignParticipationStatuses.TO_SHARE,
          deletedAt,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.ABORTED,
        });
        await databaseBuilder.commit();

        const [campaignParticipation] = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        expect(campaignParticipation.disabledAt).to.deep.equal(deletedAt);
      });

      it('retrieves archived date', async function () {
        const archivedAt = new Date('2020-05-26T09:54:00Z');
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
          archivedAt,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          status: CampaignParticipationStatuses.TO_SHARE,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.ABORTED,
        });
        await databaseBuilder.commit();

        const [campaignParticipation] = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        expect(campaignParticipation.disabledAt).to.deep.equal(archivedAt);
      });
    });

    context('when there are filters', function () {
      let onGoingParticipation;
      let toShareParticipation;
      let endedParticipation;
      let archivedParticipation;
      let deletedParticipation;

      beforeEach(async function () {
        const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        const { id: campaign3Id } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        const { id: campaign4Id } = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
          archivedAt: new Date('2020-01-02'),
        });
        const { id: campaign5Id } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        onGoingParticipation = campaignParticipationOverviewFactory.build({
          userId,
          assessmentState: Assessment.states.STARTED,
          sharedAt: null,
          campaignId: campaign1Id,
        });
        toShareParticipation = campaignParticipationOverviewFactory.build({
          userId,
          assessmentState: Assessment.states.COMPLETED,
          sharedAt: null,
          campaignId: campaign2Id,
        });
        endedParticipation = campaignParticipationOverviewFactory.build({
          userId,
          sharedAt: new Date('2020-01-02'),
          campaignId: campaign3Id,
        });
        archivedParticipation = campaignParticipationOverviewFactory.build({
          userId,
          sharedAt: null,
          campaignId: campaign4Id,
        });
        deletedParticipation = campaignParticipationOverviewFactory.build({
          userId,
          sharedAt: null,
          campaignId: campaign5Id,
          deletedAt: new Date('2022-01-01'),
        });

        await databaseBuilder.commit();
      });

      context('the filter is ONGOING', function () {
        it('returns participation with a started assessment', async function () {
          const states = ['ONGOING'];
          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
            states,
          });

          expect(campaignParticipationOverviews[0].id).to.equal(onGoingParticipation.id);
          expect(campaignParticipationOverviews).to.have.lengthOf(1);
        });
      });

      context('the filter is TO_SHARE', function () {
        it('returns participation with a completed assessment', async function () {
          const states = ['TO_SHARE'];
          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
            states,
          });

          expect(campaignParticipationOverviews[0].id).to.equal(toShareParticipation.id);
          expect(campaignParticipationOverviews).to.have.lengthOf(1);
        });
      });

      context('the filter is ENDED', function () {
        it('returns shared participation', async function () {
          const states = ['ENDED'];
          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
            states,
          });

          expect(campaignParticipationOverviews[0].id).to.equal(endedParticipation.id);
          expect(campaignParticipationOverviews).to.have.lengthOf(1);
        });
      });

      context('the filter is DISABLED', function () {
        it('returns participation where the campaign is archived or the participation deleted', async function () {
          const states = ['DISABLED'];
          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
            states,
          });

          expect(campaignParticipationOverviews).to.have.lengthOf(2);
          expect(campaignParticipationOverviews.map(({ id }) => id)).to.exactlyContain([
            archivedParticipation.id,
            deletedParticipation.id,
          ]);
        });
      });

      context('when there are several statuses given for the status filter', function () {
        it('returns only participations which matches with the given statuses', async function () {
          const states = ['ONGOING', 'TO_SHARE'];
          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
            states,
          });

          expect(_.map(campaignParticipationOverviews, 'id')).to.exactlyContain([
            onGoingParticipation.id,
            toShareParticipation.id,
          ]);
        });
      });
    });

    context('order', function () {
      context('when all campaign participation have different status', function () {
        it('orders all campaign participation by status', async function () {
          const { id: participationArchived } = campaignParticipationOverviewFactory.buildArchived({
            userId,
            campaignSkills: ['recSkillId1'],
          });
          const { id: participationEndedId } = campaignParticipationOverviewFactory.buildEnded({
            userId,
            campaignSkills: ['recSkillId1'],
          });
          const { id: participationOnGoingId } = campaignParticipationOverviewFactory.buildOnGoing({
            userId,
            campaignSkills: ['recSkillId1'],
          });
          const { id: participationToShareId } = campaignParticipationOverviewFactory.buildToShare({
            userId,
            campaignSkills: ['recSkillId1'],
          });
          await databaseBuilder.commit();

          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
          });
          const campaignParticipationIds = _.map(campaignParticipationOverviews, 'id');

          expect(campaignParticipationIds).to.exactlyContainInOrder([
            participationToShareId,
            participationOnGoingId,
            participationEndedId,
            participationArchived,
          ]);
        });
      });

      context('when there are campaign participation with the same status', function () {
        it('orders all campaign participation by participation creation date', async function () {
          const { id: oldestParticipation } = campaignParticipationOverviewFactory.buildOnGoing({
            userId,
            createdAt: new Date('2020-01-01'),
            campaignSkills: ['recSkillId1'],
          });
          const { id: newestParticipation } = campaignParticipationOverviewFactory.buildOnGoing({
            userId,
            createdAt: new Date('2020-01-02'),
            campaignSkills: ['recSkillId1'],
          });
          await databaseBuilder.commit();

          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
          });
          const campaignParticipationIds = _.map(campaignParticipationOverviews, 'id');

          expect(campaignParticipationIds).to.exactlyContainInOrder([newestParticipation, oldestParticipation]);
        });
      });

      context('when there are several campaign participation with the status ended', function () {
        it('orders campaign participation by sharing date then participation creation date', async function () {
          const { id: firstParticipation } = campaignParticipationOverviewFactory.buildEnded({
            userId,
            sharedAt: new Date('2020-01-01'),
            createdAt: new Date('2020-01-04'),
            campaignSkills: ['recSkillId1'],
          });
          const { id: secondParticipation } = campaignParticipationOverviewFactory.buildEnded({
            userId,
            sharedAt: new Date('2020-01-02'),
            createdAt: new Date('2020-01-02'),
            campaignSkills: ['recSkillId1'],
          });
          const { id: lastParticipation } = campaignParticipationOverviewFactory.buildEnded({
            userId,
            sharedAt: new Date('2020-01-02'),
            createdAt: new Date('2020-01-03'),
            campaignSkills: ['recSkillId1'],
          });

          await databaseBuilder.commit();

          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
          });
          const campaignParticipationIds = _.map(campaignParticipationOverviews, 'id');

          expect(campaignParticipationIds).to.exactlyContainInOrder([
            lastParticipation,
            secondParticipation,
            firstParticipation,
          ]);
        });
      });

      context('when there are several campaign participation with the status archived', function () {
        it('orders campaign participation by participation creation date', async function () {
          const { id: firstParticipation } = campaignParticipationOverviewFactory.buildArchived({
            userId,
            sharedAt: new Date('2020-01-01'),
            createdAt: new Date('2020-01-04'),
            campaignSkills: ['recSkillId1'],
          });
          const { id: lastParticipation } = campaignParticipationOverviewFactory.buildArchived({
            userId,
            sharedAt: new Date('2020-01-02'),
            createdAt: new Date('2020-01-02'),
            campaignSkills: ['recSkillId1'],
          });
          const { id: secondParticipation } = campaignParticipationOverviewFactory.buildArchived({
            userId,
            sharedAt: null,
            createdAt: new Date('2020-01-03'),
            campaignSkills: ['recSkillId1'],
          });

          await databaseBuilder.commit();

          const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
          });
          const campaignParticipationIds = _.map(campaignParticipationOverviews, 'id');

          expect(campaignParticipationIds).to.exactlyContainInOrder([
            firstParticipation,
            secondParticipation,
            lastParticipation,
          ]);
        });
      });
    });

    context('when some campaigns are for novice so they cannot be shared', function () {
      it('should not retrieve information about campaign participation, campaign and organization of this campaign', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          title: 'Campaign ABCD',
          code: 'ABCD',
          archivedAt: new Date('2020-01-03'),
          organizationId,
          targetProfileId: targetProfile.id,
          isForAbsoluteNovice: true,
        });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          createdAt: new Date('2020-01-01'),
          sharedAt: new Date('2020-01-02'),
          validatedSkillsCount: 1,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        expect(campaignParticipationOverviews).to.deep.equal([]);
      });
    });

    context('when there is an autonomous course', function () {
      it('should not keep the autonomous course from the campaign participations list', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
        });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
        });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          validatedSkillsCount: 1,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });
    });

    context('when there is an campaign of type PROFILE_COLLECTION', function () {
      it('should not keep the autonomous course from the campaign participations list', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
          targetProfileId: null,
        });
        const organizationLearnerId =
          databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({ userId }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId,
          campaignId,
        });

        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });
    });

    context('when there is an campaign of type EXAM', function () {
      it('should not keep the autonomous course from the campaign participations list', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({ organizationId });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.EXAM,
          targetProfileId,
        });
        const organizationLearnerId =
          databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({ userId }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId,
          campaignId,
        });

        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews).to.have.lengthOf(1);
      });
    });

    context('when campaign is related to combined-course', function () {
      it('should not return them', async function () {
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId,
        });
        const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

        const campaignInCombinedCourse = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
        databaseBuilder.factory.buildCombinedCourse({
          name: 'Combinix',
          rewardType: null,
          rewardId: null,
          code: 'COMBINIX1',
          organizationId: organization.id,
          combinedCourseContents: [
            { campaignId: campaignInCombinedCourse.id },
            { moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a' },
          ],
        });
        databaseBuilder.factory.campaignParticipationOverviewFactory.build({
          userId,
          campaignId: campaignInCombinedCourse.id,
        });
        databaseBuilder.factory.campaignParticipationOverviewFactory.build({
          userId,
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews).to.have.lengthOf(1);
      });
    });

    context('canRetry computation', function () {
      it('should compute canRetry as true when all conditions are met', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
          type: CampaignTypes.ASSESSMENT,
        });

        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          userId,
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2020-01-01'), // Old enough
          masteryRate: 0.7, // Less than 100%
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews[0].canRetry).to.be.true;
      });

      it('should compute canRetry as false when campaign does not allow multiple sendings', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: false, // Multiple sendings disabled
          type: CampaignTypes.ASSESSMENT,
        });
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          userId,
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2020-01-01'),
          masteryRate: 0.7,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews[0].canRetry).to.be.false;
      });

      it('should compute canRetry as false when organization learner is not active', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
          type: CampaignTypes.ASSESSMENT,
        });
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
          isDisabled: true,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          userId,
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2020-01-01'),
          masteryRate: 0.7,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews[0].canRetry).to.be.false;
      });

      it('should compute canRetry as false when campaign is archived', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
          type: CampaignTypes.ASSESSMENT,
          archivedAt: new Date('2020-01-05'), // Campaign archived
        });
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          userId,
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2020-01-01'),
          masteryRate: 0.7,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews[0].canRetry).to.be.false;
      });

      it('should compute canRetry as true for EXAM campaign type even with 100% mastery rate', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
          type: CampaignTypes.EXAM,
        });
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          userId,
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2020-01-01'),
          masteryRate: 1.0, // 100% mastery rate
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews[0].canRetry).to.be.true;
      });

      it('should compute canRetry as false for ASSESSMENT campaign type with 100% mastery rate', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
          type: CampaignTypes.ASSESSMENT,
        });
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          userId,
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2020-01-01'),
          masteryRate: 1.0, // 100% mastery rate
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews[0].canRetry).to.be.false;
      });

      it('should compute canRetry as false when participation is not shared', async function () {
        // given
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
          type: CampaignTypes.ASSESSMENT,
        });
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          userId,
          campaignId,
          status: CampaignParticipationStatuses.STARTED, // Not shared
          sharedAt: null,
          masteryRate: 0.7,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participationId,
          state: Assessment.states.STARTED,
        });
        await databaseBuilder.commit();

        // when
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
          userId,
        });

        // then
        expect(campaignParticipationOverviews[0].canRetry).to.be.false;
      });
    });

    context('when there are combined course participations', function () {
      it('retrieves information about combined course participation and organization', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId,
        }).id;
        const combinedCourse = databaseBuilder.factory.buildCombinedCourse({
          name: 'Combinix1',
          code: 'ABCD',
          organizationId,
        });
        const secondCombinedCourse = databaseBuilder.factory.buildCombinedCourse({
          name: 'Combinix2',
          code: 'EFGH',
          organizationId,
        });
        const expectedFirstParticipation = databaseBuilder.factory.buildOrganizationLearnerParticipation({
          organizationLearnerId,
          updatedAt: new Date('2022-01-01'),
          status: OrganizationLearnerParticipationStatuses.STARTED,
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
          combinedCourseId: combinedCourse.id,
        });
        const expectedSecondParticipation = databaseBuilder.factory.buildOrganizationLearnerParticipation({
          organizationLearnerId,
          updatedAt: new Date('2022-02-02'),
          status: OrganizationLearnerParticipationStatuses.COMPLETED,
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
          combinedCourseId: secondCombinedCourse.id,
        });

        await databaseBuilder.commit();

        const [firstParticipation, secondParticipation] =
          await campaignParticipationOverviewRepository.findByUserIdWithFilters({
            userId,
          });

        expect(firstParticipation).to.deep.include({
          id: expectedFirstParticipation.id,
          campaignCode: combinedCourse.code,
          campaignTitle: combinedCourse.name,
          status: 'STARTED',
          organizationName: 'Organization ABCD',
          createdAt: expectedFirstParticipation.createdAt,
          updatedAt: expectedFirstParticipation.updatedAt,
        });
        expect(secondParticipation).to.deep.include({
          id: expectedSecondParticipation.id,
          campaignCode: secondCombinedCourse.code,
          campaignTitle: secondCombinedCourse.name,
          status: 'COMPLETED',
          organizationName: 'Organization ABCD',
          createdAt: expectedSecondParticipation.createdAt,
          updatedAt: expectedSecondParticipation.updatedAt,
        });
      });
    });
  });
});
