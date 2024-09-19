import { usecases } from '../../domain/usecases/index.js';

export const save = async (userId, rewardId) => {
  return usecases.rewardUser({ userId, rewardId });
};
