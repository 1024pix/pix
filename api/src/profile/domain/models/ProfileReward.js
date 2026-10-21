export const ProfileRewardStatuses = {
  OBTAINED: 'OBTAINED',
  NOT_OBTAINED: 'NOT_OBTAINED',
};

export class ProfileReward {
  constructor({ id, rewardId, rewardType, createdAt, userId } = {}) {
    this.id = id;
    this.userId = userId;
    this.rewardId = rewardId;
    this.rewardType = rewardType;
    this.createdAt = createdAt;
  }
}
