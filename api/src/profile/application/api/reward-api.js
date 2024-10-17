import { usecases } from '../../domain/usecases/index.js';

export const getByIdAndType = ({ rewardId, rewardType }) => {
  return usecases.getRewardByIdAndType({ rewardId, rewardType });
};
