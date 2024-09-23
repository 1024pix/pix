export const rewardUser = async function ({ userId, rewardId, profileRewardRepository }) {
  return profileRewardRepository.save({ userId, rewardId });
};
