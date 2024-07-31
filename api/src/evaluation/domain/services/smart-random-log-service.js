import { SmartRandomLog } from '../models/SmartRandomLog.js';

/**
 * @type {SmartRandomLog}
 */
let smartRandomLog = null;

export const startLogging = () => {
  smartRandomLog = new SmartRandomLog();
};

export const clearLog = () => {
  smartRandomLog = null;
};

/**
 * Log a step.
 *
 * @param stepName {string}
 * @param stepOutputSkills {Skill[]}
 */
export const logStep = (stepName, stepOutputSkills) => {
  if (smartRandomLog) {
    smartRandomLog.addStep(stepName, stepOutputSkills);
  }
};

/**
 * @param predictedLevel {number}
 */
export const logPredictedLevel = (predictedLevel) => {
  if (smartRandomLog) {
    smartRandomLog.predictedLevel = predictedLevel;
  }
};

/**
 * @param skillId {string}
 * @param reward {number}
 */
export const logSkillReward = (skillId, reward) => {
  if (smartRandomLog) {
    smartRandomLog.addSkillReward(skillId, reward);
  }
};

/**
 * @returns {SmartRandomLog}
 */
export const getSmartRandomLog = () => smartRandomLog;
