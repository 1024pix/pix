import { PROFILE_REWARDS_TABLE_NAME } from '../../../../../db/migrations/20240820101213_add-profile-rewards-table.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import {
  CRITERION_COMPARISONS,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
const { INVALIDATED, VALIDATED } = KnowledgeElement.StatusType;
const userId = 1234;

const setupContextWithProfileSkillQuest = async ({
  userId,
  isEligible = true,
  hasSecondLearner = false,
  hasValidatedKnowledgeElements = true,
  hasAlreadySucceededTheQuest = false,
}) => {
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
  if (hasSecondLearner) {
    databaseBuilder.factory.buildOrganizationLearner({
      userId,
      organizationId: databaseBuilder.factory.buildOrganization({ type: userOrganization }).id,
    });
  }
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

  const successRequirements = [
    {
      requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
      data: {
        skillIds: ['skillId1', 'skillId2', 'skillId3'],
        threshold: 50,
      },
    },
  ];

  const quest = databaseBuilder.factory.buildQuest({
    rewardType: REWARD_TYPES.ATTESTATION,
    eligibilityRequirements: [
      {
        requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
        comparison: REQUIREMENT_COMPARISONS.ALL,
        data: {
          type: {
            data: questOrganization,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
        },
      },
    ],
    successRequirements,
  });

  if (hasAlreadySucceededTheQuest) {
    databaseBuilder.factory.buildProfileReward({
      rewardId: quest.rewardId,
      userId,
    });
  }

  await databaseBuilder.commit();
};

const setupContextWithCappedTubesQuest = async ({
  userId,
  isEligible = true,
  hasValidatedKnowledgeElements = true,
  hasAlreadySucceededTheQuest = false,
  buildCampaignParticipation = true,
}) => {
  databaseBuilder.factory.buildUser({ id: userId });
  const questOrganization = 'PRO';
  const userOrganization = isEligible ? questOrganization : 'SCO';

  const userKnowledgeElements = [
    {
      userId,
      skillId: 'skillId1_tube1',
      status: hasValidatedKnowledgeElements ? VALIDATED : INVALIDATED,
    },
    {
      userId,
      skillId: 'skillId2_tube1',
      status: hasValidatedKnowledgeElements ? VALIDATED : INVALIDATED,
    },
    {
      userId,
      skillId: 'skillId1_tube2',
      status: hasValidatedKnowledgeElements ? VALIDATED : INVALIDATED,
    },
  ];
  userKnowledgeElements.map(databaseBuilder.factory.buildKnowledgeElement);

  const organization = databaseBuilder.factory.buildOrganization({ type: userOrganization });
  const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
    userId,
    organizationId: organization.id,
  });

  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

  databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'firstTube', level: 2 });
  databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'secondTube', level: 1 });

  databaseBuilder.factory.learningContent.buildTube({
    id: 'firstTube',
  });
  databaseBuilder.factory.learningContent.buildTube({
    id: 'secondTube',
  });
  databaseBuilder.factory.learningContent.buildSkill({
    id: 'skillId1_tube1',
    tubeId: 'firstTube',
    status: 'actif',
    level: 1,
  });
  databaseBuilder.factory.learningContent.buildSkill({
    id: 'skillId2_tube1',
    tubeId: 'secondTube',
    status: 'actif',
    level: 2,
  });
  databaseBuilder.factory.learningContent.buildSkill({
    id: 'skillId1_tube2',
    tubeId: 'secondTube',
    status: 'actif',
    level: 1,
  });

  const { id: campaignId } = databaseBuilder.factory.buildCampaign({
    organizationId: organization.id,
    targetProfileId,
  });

  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skillId1_tube2' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skillId2_tube1' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skillId1_tube1' });

  if (buildCampaignParticipation) {
    databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      organizationLearnerId,
      userId,
    });
  }

  const quest = databaseBuilder.factory.buildQuest({
    rewardType: REWARD_TYPES.ATTESTATION,
    eligibilityRequirements: [
      {
        requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
        comparison: REQUIREMENT_COMPARISONS.ALL,
        data: {
          type: {
            data: questOrganization,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
        },
      },
      {
        requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
        comparison: REQUIREMENT_COMPARISONS.ALL,
        data: {
          targetProfileId: {
            data: targetProfileId,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
        },
      },
    ],
    successRequirements: [
      {
        requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
        data: {
          cappedTubes: [
            { tubeId: 'firstTube', level: 2 },
            { tubeId: 'secondTube', level: 1 },
          ],
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
  describe('skillProfile', function () {
    context('when user is eligible and meets success requirements', function () {
      beforeEach(async function () {
        await setupContextWithProfileSkillQuest({ userId });
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

    context('when user is eligible twice and meets success requirements in second learner', function () {
      beforeEach(async function () {
        await setupContextWithProfileSkillQuest({ userId, hasSecondLearner: true });
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

    context('when user is eligible with two organization learner for the same quest', function () {
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

        const firstOrganization = databaseBuilder.factory.buildOrganization({ type: questOrganization });
        const secondOrganization = databaseBuilder.factory.buildOrganization({ type: questOrganization });

        [firstOrganization.id, secondOrganization.id].forEach((organizationId) => {
          const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
            userId,
            organizationId,
          });

          const { id: campaignId } = databaseBuilder.factory.buildCampaign({
            organizationId,
          });
          const { id: secondCampaignId } = databaseBuilder.factory.buildCampaign({
            organizationId,
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
        });

        const rewardId = databaseBuilder.factory.buildAttestation().id;

        databaseBuilder.factory.buildQuest({
          rewardType: REWARD_TYPES.ATTESTATION,
          rewardId,
          eligibilityRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
              comparison: REQUIREMENT_COMPARISONS.ALL,
              data: {
                type: {
                  data: questOrganization,
                  comparison: CRITERION_COMPARISONS.EQUAL,
                },
              },
            },
          ],
          successRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
              data: {
                skillIds: ['skillId1', 'skillId2', 'skillId3'],
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
          rewardType: REWARD_TYPES.ATTESTATION,
          rewardId,
          eligibilityRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
              comparison: REQUIREMENT_COMPARISONS.ALL,
              data: {
                type: {
                  data: questOrganization,
                  comparison: CRITERION_COMPARISONS.EQUAL,
                },
              },
            },
          ],
          successRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
              data: {
                skillIds: ['skillId1', 'skillId2', 'skillId3'],
                threshold: 50,
              },
            },
          ],
        });
        databaseBuilder.factory.buildQuest({
          rewardType: REWARD_TYPES.ATTESTATION,
          rewardId,
          eligibilityRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
              comparison: REQUIREMENT_COMPARISONS.ALL,
              data: {
                type: {
                  data: questOrganization,
                  comparison: CRITERION_COMPARISONS.EQUAL,
                },
              },
            },
          ],
          successRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
              data: {
                skillIds: ['skillId1', 'skillId2', 'skillId3'],
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
      beforeEach(async function () {
        await setupContextWithProfileSkillQuest({ userId, isEligible: false });
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
      beforeEach(async function () {
        await setupContextWithProfileSkillQuest({ userId, hasValidatedKnowledgeElements: false });
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
      beforeEach(async function () {
        await setupContextWithProfileSkillQuest({
          userId,
          isEligible: true,
          hasAlreadySucceededTheQuest: true,
          hasValidatedKnowledgeElements: true,
        });
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

  describe('cappedTube', function () {
    context('when user is eligible and meets success requirements', function () {
      beforeEach(async function () {
        await setupContextWithCappedTubesQuest({ userId });
      });

      it('should reward the user with campaignSkills informations', async function () {
        //when
        await usecases.rewardUser({ userId });

        // then
        const profileRewards = await knex(PROFILE_REWARDS_TABLE_NAME).where({ userId });
        expect(profileRewards).to.have.lengthOf(1);
        expect(profileRewards[0].userId).to.equal(userId);
      });

      it('should reward the user with targetProfileTube informations', async function () {
        //when
        await usecases.rewardUser({ userId, buildCampaignParticipation: false });

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
          rewardType: REWARD_TYPES.ATTESTATION,
          rewardId,
          eligibilityRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
              comparison: REQUIREMENT_COMPARISONS.ALL,
              data: {
                type: {
                  data: questOrganization,
                  comparison: CRITERION_COMPARISONS.EQUAL,
                },
              },
            },
          ],
          successRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
              data: {
                skillIds: ['skillId1', 'skillId2', 'skillId3'],
                threshold: 50,
              },
            },
          ],
        });
        databaseBuilder.factory.buildQuest({
          rewardType: REWARD_TYPES.ATTESTATION,
          rewardId,
          eligibilityRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
              comparison: REQUIREMENT_COMPARISONS.ALL,
              data: {
                type: {
                  data: questOrganization,
                  comparison: CRITERION_COMPARISONS.EQUAL,
                },
              },
            },
          ],
          successRequirements: [
            {
              requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
              data: {
                skillIds: ['skillId1', 'skillId2', 'skillId3'],
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
      beforeEach(async function () {
        await setupContextWithCappedTubesQuest({ userId, isEligible: false });
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
      beforeEach(async function () {
        await setupContextWithCappedTubesQuest({ userId, hasValidatedKnowledgeElements: false });
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
      beforeEach(async function () {
        await setupContextWithCappedTubesQuest({ userId, hasAlreadySucceededTheQuest: true });
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
});
