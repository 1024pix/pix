import { Assessment as SharedAssessment } from '../../../shared/domain/models/Assessment.js';
class Assessment extends SharedAssessment {
  constructor({ id, missionId, organizationLearnerId, state } = {}) {
    super({ id, state });
    this.missionId = missionId;
    this.organizationLearnerId = organizationLearnerId;
  }
}

export { Assessment };
