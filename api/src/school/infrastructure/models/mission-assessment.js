export class MissionAssessment {
  constructor({ missionId, assessmentId, organizationLearnerId, result } = {}) {
    this.assessmentId = assessmentId;
    this.missionId = missionId;
    this.organizationLearnerId = organizationLearnerId;
    this.result = result;
  }
}
