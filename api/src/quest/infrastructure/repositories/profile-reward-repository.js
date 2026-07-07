import { QuestResult } from '../../domain/models/quests/value-objects/QuestResult.js';

export const findByUserIdAndRewardId = async ({ rewardId, userId, profileRewardApi }) => {
  return profileRewardApi.findByUserIdAndRewardId({ rewardId, userId });
};

export const findByUserIdsAndRewardId = async ({ rewardId, userIds, profileRewardApi }) => {
  return profileRewardApi.findByUserIdsAndRewardId({ rewardId, userIds });
};

export const reward = async ({ userId, rewardId, organizationId, profileRewardApi }) => {
  await profileRewardApi.save(userId, rewardId);

  if (organizationId) {
    const profileReward = await profileRewardApi.findByUserIdAndRewardId({ rewardId, userId });
    await profileRewardApi.shareWithOrganization({ userId, profileRewardId: profileReward.id, organizationId });
  }
};

export const getByUserId = async ({ userId, profileRewardApi }) => {
  return profileRewardApi.getByUserId(userId);
};

export const getByQuestAndUserId = async ({
  userId,
  quest,
  rewardApi,
  profileRewardApi,
  profileRewardTemporaryStorage,
}) => {
  const reward = await rewardApi.getByIdAndType({ rewardId: quest.rewardId, rewardType: quest.rewardType });
  const profileRewards = await profileRewardApi.getByUserId(userId);

  const profileRewardForQuest = profileRewards.find(
    (profileReward) => profileReward.rewardType === quest.rewardType && profileReward.rewardId === quest.rewardId,
  );

  if (profileRewardForQuest) {
    return new QuestResult({
      id: quest.id,
      obtained: true,
      profileRewardId: profileRewardForQuest.id,
      reward,
    });
  }

  let obtained = false;

  const isProcessing = Number(await profileRewardTemporaryStorage.get(userId)) > 0;

  if (isProcessing) {
    obtained = null;
  }

  return new QuestResult({
    id: quest.id,
    obtained,
    profileRewardId: null,
    reward,
  });
};
