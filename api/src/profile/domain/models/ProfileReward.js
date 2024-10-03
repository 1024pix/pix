export class ProfileReward {
  constructor({ id, rewardId, rewardType, createdAt } = {}) {
    this.id = id;
    this.rewardId = rewardId;
    this.rewardType = rewardType;
    this.createdAt = createdAt;
  }
}
