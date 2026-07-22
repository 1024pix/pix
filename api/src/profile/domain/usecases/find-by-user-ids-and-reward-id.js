export const findByUserIdsAndRewardId = ({ rewardId, userIds, profileRewardRepository }) => {
  return profileRewardRepository.findByUserIdsAndRewardId({ rewardId, userIds });
};
