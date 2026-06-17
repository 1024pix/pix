export class QuestResult {
  constructor({ id, obtained, reward, profileRewardId }) {
    this.id = id;
    this.obtained = obtained;
    this.profileRewardId = profileRewardId;
    this.reward = reward;
  }
}
