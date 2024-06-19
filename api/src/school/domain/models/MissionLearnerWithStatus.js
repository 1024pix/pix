import { MissionLearner } from './MissionLearner.js';

class MissionLearnerWithStatus extends MissionLearner {
  constructor({ status } = {}) {
    super(...arguments);
    this.status = status;
  }
}

export { MissionLearnerWithStatus };
