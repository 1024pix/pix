import { MissionLearner } from './MissionLearner.js';

class MissionLearnerWithStatus extends MissionLearner {
  constructor({ status, result } = {}) {
    super(...arguments);
    this.status = status;
    this.result = result;
  }
}

export { MissionLearnerWithStatus };
