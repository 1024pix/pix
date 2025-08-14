import { PromiseUtils as injectedPromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import * as injectedRewardRepository from '../../infrastructure/repositories/reward-repository.js';
import { AttestationDetail } from '../models/AttestationDetail.js';

export async function getAttestationDetails({
  profileRewards = [],
  rewardRepository = injectedRewardRepository,
  PromiseUtils = injectedPromiseUtils,
} = {}) {
  return PromiseUtils.map(profileRewards, async (profileReward) => {
    const reward = await rewardRepository.getByIdAndType({
      rewardId: profileReward.rewardId,
      rewardType: profileReward.rewardType,
    });

    return new AttestationDetail({ id: profileReward.id, obtainedAt: profileReward.createdAt, type: reward.key });
  });
}
