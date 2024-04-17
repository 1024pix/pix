import { Activity } from './Activity.js';

class ActivityInfo {
  constructor({ stepIndex, level }) {
    this.stepIndex = stepIndex;
    this.level = level;
  }
}

ActivityInfo.levels = Activity.levels;

export { ActivityInfo };
