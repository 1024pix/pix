import {
  CRITERION_COMPARISONS,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect } from '../../../../test-helper.js';
const { INVALIDATED, VALIDATED } = KnowledgeElement.StatusType;
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';

describe('Integration | Quest | Domain | UseCases | check-user-quest-success', function () {
  it('should return undefined if userId not defined', async function () {
    // given
    const questId = 1;

    // when
    const result = await usecases.checkUserQuest({ userId: null, questId });

    // then
    expect(result).to.be.undefined;
  });

  it('should return not found error if quest does not exist', async function () {
    // given
    const nonExistentQuestId = 2;
    const userId = 1234;
    databaseBuilder.factory.buildQuest({ id: 1 });
    await databaseBuilder.commit();

    // when
    const result = await catchErr(usecases.checkUserQuest)({ userId, questId: nonExistentQuestId });

    // then
    expect(result).to.be.instanceOf(NotFoundError);
  });

  it('should return true if quest do not have eligibility requirements or success', async function () {
    // given
    const userId = 1234;
    const questId = 1;
    databaseBuilder.factory.buildUser({ id: userId });
    databaseBuilder.factory.buildQuest({
      id: questId,
      eligibilityRequirements: [],
      successRequirements: [],
    });
    await databaseBuilder.commit();
    // when
    const result = await usecases.checkUserQuest({ userId, questId });
    // then
    expect(result).to.be.true;
  });

  it('should return true if user match the quest eligibility and success requirements', async function () {
    // given
    const questId = 1;
    const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
    const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
    });
    const firstTargetProfile = databaseBuilder.factory.buildTargetProfile();
    const firstCampaign = databaseBuilder.factory.buildCampaign({
      organizationId,
      targetProfileId: firstTargetProfile.id,
    });
    databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
      campaignId: firstCampaign.id,
      userId,
    });
    const userKnowledgeElements = [
      {
        userId,
        skillId: 'skillId1',
        status: VALIDATED,
      },
    ];
    userKnowledgeElements.map(databaseBuilder.factory.buildKnowledgeElement);
    databaseBuilder.factory.buildQuest({
      id: questId,
      eligibilityRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: firstTargetProfile.id,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ],
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
          data: {
            skillIds: ['skillId1'],
            threshold: 50,
          },
        },
      ],
    });
    await databaseBuilder.commit();
    // when
    const result = await usecases.checkUserQuest({ userId, questId });
    // then
    expect(result).to.be.true;
  });

  it('should return false if user does not match the success requirements', async function () {
    // given
    const questId = 1;
    const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
    const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
    });
    const firstTargetProfile = databaseBuilder.factory.buildTargetProfile();
    const firstCampaign = databaseBuilder.factory.buildCampaign({
      organizationId,
      targetProfileId: firstTargetProfile.id,
    });
    databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
      campaignId: firstCampaign.id,
      userId,
    });
    const userKnowledgeElements = [
      {
        userId,
        skillId: 'skillId1',
        status: INVALIDATED,
      },
    ];
    userKnowledgeElements.map(databaseBuilder.factory.buildKnowledgeElement);
    databaseBuilder.factory.buildQuest({
      id: questId,
      eligibilityRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: firstTargetProfile.id,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ],
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
          data: {
            skillIds: ['skillId1'],
            threshold: 50,
          },
        },
      ],
    });
    await databaseBuilder.commit();
    // when
    const result = await usecases.checkUserQuest({ userId, questId });
    // then
    expect(result).to.be.false;
  });

  it('should return false if user does not match the eligibility requirements', async function () {
    // given
    const questId = 1;
    const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
    const { userId } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
    });
    const firstTargetProfile = databaseBuilder.factory.buildTargetProfile();
    const userKnowledgeElements = [
      {
        userId,
        skillId: 'skillId1',
        status: VALIDATED,
      },
    ];
    userKnowledgeElements.map(databaseBuilder.factory.buildKnowledgeElement);
    databaseBuilder.factory.buildQuest({
      id: questId,
      eligibilityRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: firstTargetProfile.id,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ],
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
          data: {
            skillIds: ['skillId1'],
            threshold: 50,
          },
        },
      ],
    });
    await databaseBuilder.commit();
    // when
    const result = await usecases.checkUserQuest({ userId, questId });
    // then
    expect(result).to.be.false;
  });
});
