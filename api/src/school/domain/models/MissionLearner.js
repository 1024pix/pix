import { SchoolLearner } from './SchoolLearner.js';

class MissionLearner extends SchoolLearner {
  constructor({ missionStatus, result = null } = {}) {
    super(...arguments);
    this.missionStatus = missionStatus;
    this.result = result;
  }
}

export { MissionLearner };
