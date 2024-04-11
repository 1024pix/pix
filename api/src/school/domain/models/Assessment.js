import { Assessment as SharedAssessment } from '../../../shared/domain/models/Assessment.js';

class Assessment extends SharedAssessment {
  constructor({ missionId, organizationLearnerId, ...args } = {}) {
    super({ ...args });
    this.missionId = missionId;
    this.organizationLearnerId = organizationLearnerId;
  }
}

export { Assessment };
