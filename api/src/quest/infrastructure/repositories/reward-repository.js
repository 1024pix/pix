import { QuestResult } from '../../domain/models/QuestResult.js';

export const reward = async ({ userId, rewardId, profileRewardApi }) => {
  return profileRewardApi.save(userId, rewardId);
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
