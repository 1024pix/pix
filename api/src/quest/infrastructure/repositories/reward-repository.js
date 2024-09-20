export const reward = async ({ userId, rewardId, profileRewardApi }) => {
  return profileRewardApi.save(userId, rewardId);
};

export const getByUserId = async ({ userId, profileRewardApi }) => {
  return profileRewardApi.getByUserId(userId);
};
