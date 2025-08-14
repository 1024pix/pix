import * as injectedRewardRepository from '../../infrastructure/repositories/reward-repository.js';
export const getRewardByIdAndType = ({ rewardId, rewardType, rewardRepository = injectedRewardRepository } = {}) => {
  return rewardRepository.getByIdAndType({ rewardId, rewardType });
};
