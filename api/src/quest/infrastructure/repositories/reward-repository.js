export const reward = async ({ userId, rewardId, profileRewardApi }) => {
  return profileRewardApi.save(userId, rewardId);
};
