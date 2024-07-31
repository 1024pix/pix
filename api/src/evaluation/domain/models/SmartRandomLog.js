import { SmartRandomSkillReward } from './SmartRandomSkillReward.js';
import { SmartRandomStep } from './SmartRandomStep.js';

export class SmartRandomLog {
  /**
   * @type {SmartRandomStep[]}
   */
  steps = [];

  /**
   * @type {SmartRandomSkillReward[]}
   */
  skillRewards = [];

  /**
   * @type {number | null}
   */
  predictedLevel = null;

  /**
   *
   * @param {string} stepName
   * @param {Skill[]} outputSkills
   */
  addStep(stepName, outputSkills) {
    this.steps.push(new SmartRandomStep(stepName, outputSkills));
  }

  /**
   * @param skillId {string}
   * @param reward {number}
   */
  addSkillReward(skillId, reward) {
    this.skillRewards.push(new SmartRandomSkillReward(skillId, reward));
  }
}
