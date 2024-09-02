import { Assessment as SharedAssessment } from '../../../shared/domain/models/Assessment.js';

const results = {
  EXCEEDED: 'exceeded',
  REACHED: 'reached',
  PARTIALLY_REACHED: 'partially_reached',
  NOT_REACHED: 'not_reached',
};

class Assessment extends SharedAssessment {
  constructor({ missionId, organizationLearnerId, ...args } = {}) {
    super({ ...args });
    this.missionId = missionId;
    this.organizationLearnerId = organizationLearnerId;

    if (args.result) {
      this.result = args.result;
    }
  }
}

Assessment.results = results;

export { Assessment };
