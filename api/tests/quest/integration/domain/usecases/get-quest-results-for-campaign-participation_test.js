import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { QuestResult } from '../../../../../src/quest/domain/models/QuestResult.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Quest | Integration | Domain | Usecases | getQuestResultsForCampaignParticipation', function () {
  describe('when there are multiple target profiles in the quest requirements', function () {
    it('should get quest results for campaign participation belonging to one of the target profiles', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });

      // build target profiles

      const firstTargetProfile = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organizationId,
      });
      const secondTargetProfile = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organizationId,
      });

      // build campaigns

      const firstCampaign = databaseBuilder.factory.buildCampaign({
        organizationId,
        targetProfileId: firstTargetProfile.id,
      });

      const secondCampaign = databaseBuilder.factory.buildCampaign({
        organizationId,
        targetProfileId: secondTargetProfile.id,
      });

      // build campaign participations

      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
        campaignId: firstCampaign.id,
        userId,
      });

      const { id: secondCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
        campaignId: secondCampaign.id,
        userId,
      });

      const rewardId = databaseBuilder.factory.buildAttestation().id;
      const questId = databaseBuilder.factory.buildQuest({
        rewardType: 'attestations',
        rewardId,
        eligibilityRequirements: [
          {
            type: 'organization',
            data: {
              type: 'SCO',
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: 'campaignParticipations',
            data: {
              targetProfileIds: [firstTargetProfile.id],
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: 'campaignParticipations',
            data: {
              targetProfileIds: [secondTargetProfile.id],
            },
            comparison: COMPARISON.ALL,
          },
        ],
        successRequirements: [],
      }).id;

      await databaseBuilder.commit();

      const result = await usecases.getQuestResultsForCampaignParticipation({
        userId,
        campaignParticipationId: secondCampaignParticipationId,
      });

      expect(result[0]).to.be.instanceOf(QuestResult);
      expect(result[0].id).to.equal(questId);
      expect(result[0].reward.id).to.equal(rewardId);
    });

    it('should not return quest results for campaign participation if user has not participated to campaigns linked to all profiles target in quest requirement', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });

      // build target profiles
      const firstTargetProfile = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organizationId,
      });
      const secondTargetProfile = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organizationId,
      });
      const thirdTargetProfile = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organizationId,
      });

      // build campaigns
      const firstCampaign = databaseBuilder.factory.buildCampaign({
        organizationId,
        targetProfileId: firstTargetProfile.id,
      });

      const secondCampaign = databaseBuilder.factory.buildCampaign({
        organizationId,
        targetProfileId: secondTargetProfile.id,
      });

      databaseBuilder.factory.buildCampaign({
        organizationId,
        targetProfileId: thirdTargetProfile.id,
      });

      // build campaign participations
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
        campaignId: firstCampaign.id,
        userId,
      });

      const { id: secondCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
        campaignId: secondCampaign.id,
        userId,
      });

      const rewardId = databaseBuilder.factory.buildAttestation().id;

      databaseBuilder.factory.buildQuest({
        rewardType: 'attestations',
        rewardId,
        eligibilityRequirements: [
          {
            type: 'organization',
            data: {
              type: 'SCO',
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: 'campaignParticipations',
            data: {
              targetProfileIds: [firstTargetProfile.id],
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: 'campaignParticipations',
            data: {
              targetProfileIds: [secondTargetProfile.id],
            },
            comparison: COMPARISON.ALL,
          },
          {
            type: 'campaignParticipations',
            data: {
              targetProfileIds: [thirdTargetProfile.id],
            },
            comparison: COMPARISON.ALL,
          },
        ],
        successRequirements: [],
      }).id;

      await databaseBuilder.commit();

      const result = await usecases.getQuestResultsForCampaignParticipation({
        userId,
        campaignParticipationId: secondCampaignParticipationId,
      });
      expect(result).to.be.empty;
    });
  });

  it('should get quest results for campaign participation', async function () {
    const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
    const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
    const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
      userId,
    });
    const rewardId = databaseBuilder.factory.buildAttestation().id;
    const questId = databaseBuilder.factory.buildQuest({
      rewardType: 'attestations',
      rewardId,
      eligibilityRequirements: [
        {
          type: 'organization',
          data: {
            type: 'SCO',
          },
          comparison: COMPARISON.ALL,
        },
      ],
      successRequirements: [],
    }).id;

    await databaseBuilder.commit();

    const result = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });

    expect(result[0]).to.be.instanceOf(QuestResult);
    expect(result[0].id).to.equal(questId);
    expect(result[0].obtained).to.equal(false);
    expect(result[0].reward.id).to.equal(rewardId);
  });

  it('should not return quest results for other campaign participation', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
    const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

    const { id: notEligibleParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
      userId,
    });
    const targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;
    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId }).id;
    databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
      campaignId,
      userId,
    });
    const rewardId = databaseBuilder.factory.buildAttestation().id;
    databaseBuilder.factory.buildQuest({
      rewardType: 'attestations',
      rewardId,
      eligibilityRequirements: [
        {
          type: 'organization',
          data: {
            type: 'SCO',
          },
          comparison: COMPARISON.ALL,
        },
        {
          type: 'campaignParticipations',
          data: {
            targetProfileIds: [targetProfileId],
          },
          comparison: COMPARISON.ALL,
        },
      ],
      successRequirements: [],
    }).id;
    await databaseBuilder.commit();

    // when
    const result = await usecases.getQuestResultsForCampaignParticipation({
      userId,
      campaignParticipationId: notEligibleParticipationId,
    });

    // then
    expect(result).to.be.empty;
  });
});
