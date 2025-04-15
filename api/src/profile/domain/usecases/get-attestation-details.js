import { AttestationDetail } from '../models/AttestationDetail.js';

export async function getAttestationDetails({ profileRewards = [], rewardRepository, PromiseUtils }) {
  return PromiseUtils.map(profileRewards, async (profileReward) => {
    const reward = await rewardRepository.getByIdAndType({
      rewardId: profileReward.rewardId,
      rewardType: profileReward.rewardType,
    });

    return new AttestationDetail({ id: profileReward.id, obtainedAt: profileReward.createdAt, type: reward.key });
  });
}
