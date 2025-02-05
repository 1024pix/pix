import { PROFILE_REWARDS_TABLE_NAME } from '../../../../../db/migrations/20240820101213_add-profile-rewards-table.js';
import { TYPES } from '../../../../../src/quest/domain/models/Eligibility.js';
import { COMPARISON } from '../../../../../src/quest/domain/models/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';
const { INVALIDATED, VALIDATED } = KnowledgeElement.StatusType;

const userId = 1234;
const setupContext = async (
  userId,
  isEligible = true,
  hasValidatedKnowledgeElements = true,
  hasAlreadySucceededTheQuest = false,
) => {
  databaseBuilder.factory.buildUser({ id: userId });
  const questOrganization = 'PRO';
  const userOrganization = isEligible ? questOrganization : 'SCO';

  const userKnowledgeElements = [
    {
      userId,
      skillId: 'skillId1',
      status: hasValidatedKnowledgeElements ? VALIDATED : INVALIDATED,
    },
    {
      userId,
      skillId: 'skillId2',
      status: hasValidatedKnowledgeElements ? VALIDATED : INVALIDATED,
    },
    {
      userId,
      skillId: 'skillId3',
      status: hasValidatedKnowledgeElements ? VALIDATED : INVALIDATED,
    },
  ];
  userKnowledgeElements.map(databaseBuilder.factory.buildKnowledgeElement);

  const organization = databaseBuilder.factory.buildOrganization({ type: userOrganization });
  const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
    userId,
    organizationId: organization.id,
  });

  const { id: campaignId } = databaseBuilder.factory.buildCampaign({
    organizationId: organization.id,
  });

  databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    organizationLearnerId,
    userId,
  });

  const quest = databaseBuilder.factory.buildQuest({
    eligibilityRequirements: [
      {
        type: TYPES.ORGANIZATION,
        comparison: COMPARISON.ALL,
        data: {
          type: questOrganization,
        },
      },
    ],
    successRequirements: [
      {
        type: 'skills',
        data: {
          ids: ['skillId1', 'skillId2', 'skillId3'],
          threshold: 50,
        },
      },
    ],
  });

  if (hasAlreadySucceededTheQuest) {
    databaseBuilder.factory.buildProfileReward({
      rewardId: quest.rewardId,
      userId,
    });
  }

  await databaseBuilder.commit();
};

describe('Quest | Integration | Domain | Usecases | RewardUser', function () {
  context('when user is eligible and meets success requirements', function () {
    before(async function () {
      await setupContext(userId);
    });

    it('should reward the user', async function () {
      //when
      await usecases.rewardUser({ userId });

      // then
      const profileRewards = await knex(PROFILE_REWARDS_TABLE_NAME).where({ userId });
      expect(profileRewards).to.have.lengthOf(1);
      expect(profileRewards[0].userId).to.equal(userId);
    });
  });

  context('when user is eligible at two quests with the same rewardId', function () {
    let userId;
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      const questOrganization = 'PRO';
      const userKnowledgeElements = [
        {
          userId,
          skillId: 'skillId1',
          status: VALIDATED,
        },
        {
          userId,
          skillId: 'skillId2',
          status: VALIDATED,
        },
        {
          userId,
          skillId: 'skillId3',
          status: VALIDATED,
        },
      ];
      userKnowledgeElements.map(databaseBuilder.factory.buildKnowledgeElement);

      const organization = databaseBuilder.factory.buildOrganization({ type: questOrganization });
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
        userId,
        organizationId: organization.id,
      });

      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      });
      const { id: secondCampaignId } = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        userId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: secondCampaignId,
        organizationLearnerId,
        userId,
      });
      const rewardId = databaseBuilder.factory.buildAttestation().id;

      databaseBuilder.factory.buildQuest({
        rewardId,
        eligibilityRequirements: [
          {
            type: TYPES.ORGANIZATION,
            comparison: COMPARISON.ALL,
            data: {
              type: questOrganization,
            },
          },
        ],
        successRequirements: [
          {
            type: 'skills',
            data: {
              ids: ['skillId1', 'skillId2', 'skillId3'],
              threshold: 50,
            },
          },
        ],
      });
      databaseBuilder.factory.buildQuest({
        rewardId,
        eligibilityRequirements: [
          {
            type: TYPES.ORGANIZATION,
            comparison: COMPARISON.ALL,
            data: {
              type: questOrganization,
            },
          },
        ],
        successRequirements: [
          {
            type: 'skills',
            data: {
              ids: ['skillId1', 'skillId2', 'skillId3'],
              threshold: 50,
            },
          },
        ],
      });

      await databaseBuilder.commit();
    });

    it('should reward the user only once', async function () {
      //when
      await usecases.rewardUser({ userId });

      // then
      const profileRewards = await knex(PROFILE_REWARDS_TABLE_NAME).where({ userId });
      expect(profileRewards).to.have.lengthOf(1);
    });
  });

  context('when user is not eligible', function () {
    before(async function () {
      await setupContext(userId, false);
    });

    it('should not reward the user', async function () {
      //when
      await usecases.rewardUser({ userId });

      // then
      const profileRewards = await knex(PROFILE_REWARDS_TABLE_NAME).where({ userId });
      expect(profileRewards).to.have.lengthOf(0);
    });
  });

  context('when user is eligible but does not meet success requirements', function () {
    before(async function () {
      await setupContext(userId, true, false);
    });

    it('should not reward the user', async function () {
      //when
      await usecases.rewardUser({ userId });

      // then
      const profileRewards = await knex(PROFILE_REWARDS_TABLE_NAME).where({ userId });
      expect(profileRewards).to.have.lengthOf(0);
    });
  });

  context('when user has already earned a reward for the quest', function () {
    before(async function () {
      await setupContext(userId, true, true, true);
    });

    it('should not reward the user a second time', async function () {
      //when
      await usecases.rewardUser({ userId });

      // then
      const profileRewards = await knex(PROFILE_REWARDS_TABLE_NAME).where({ userId });
      expect(profileRewards).to.have.lengthOf(1);
      expect(profileRewards[0].userId).to.equal(userId);
    });
  });
});
