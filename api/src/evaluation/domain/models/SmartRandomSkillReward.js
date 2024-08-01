export class SmartRandomSkillReward {
  /**
   * @type {string}
   */
  skillId;

  /**
   * @type {number}
   */
  reward;

  /**
   * @param skillId
   * @param reward
   */
  constructor(skillId, reward) {
    this.skillId = skillId;
    this.reward = reward;
  }
}
