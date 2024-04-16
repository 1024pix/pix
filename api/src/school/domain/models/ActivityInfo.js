import { Activity } from './Activity.js';

class ActivityInfo {
  constructor({ level }) {
    this.level = level;
  }
}

ActivityInfo.levels = Activity.levels;

export { ActivityInfo };
