import { usecases } from '../../domain/usecases/index.js';

export const save = async (userId, rewardId) => {
  return usecases.rewardUser({ userId, rewardId });
};

export const getByUserId = async (userId) => {
  return usecases.getProfileRewardsByUserId({ userId });
};

export const findByUserIdAndRewardId = async ({ rewardId, userId }) => {
  return usecases.findByUserIdAndRewardId({ rewardId, userId });
};

export const shareWithOrganization = async ({ userId, profileRewardId, organizationId }) => {
  return usecases.shareProfileReward({ userId, profileRewardId, organizationId });
};
