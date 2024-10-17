export const getRewardByIdAndType = ({ rewardId, rewardType, rewardRepository }) => {
  return rewardRepository.getByIdAndType({ rewardId, rewardType });
};
