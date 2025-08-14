import * as injectedProfileRewardRepository from '../../infrastructure/repositories/profile-reward-repository.js';
export const getProfileRewardsByUserId = async function ({
  userId,
  profileRewardRepository = injectedProfileRewardRepository,
} = {}) {
  return profileRewardRepository.getByUserId({ userId });
};
