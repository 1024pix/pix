import { SchoolLearner } from './SchoolLearner.js';

class MissionLearner extends SchoolLearner {
  constructor({ status, result } = {}) {
    super(...arguments);
    this.status = status;
    this.result = result;
  }
}

export { MissionLearner };
