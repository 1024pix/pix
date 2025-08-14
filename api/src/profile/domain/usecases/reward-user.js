import * as injectedProfileRewardRepository from '../../infrastructure/repositories/profile-reward-repository.js';
export const rewardUser = async function ({
  userId,
  rewardId,
  profileRewardRepository = injectedProfileRewardRepository,
} = {}) {
  return profileRewardRepository.save({ userId, rewardId });
};
