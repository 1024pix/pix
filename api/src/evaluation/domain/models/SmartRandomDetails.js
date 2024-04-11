import { SmartRandomStep } from './SmartRandomStep.js';

class SmartRandomDetails {
  /**
   * @type {SmartRandomStep[]}
   */
  steps = [];

  /**
   * @type {number | null}
   */
  predictedLevel = null;

  /**
   * @param {string} stepName
   * @param {[Skill]} outputSkills
   */
  addStep(stepName, outputSkills) {
    this.steps.push(new SmartRandomStep(stepName, outputSkills));
  }
}

export { SmartRandomDetails };
