class MissionAssessment {
  constructor({ missionId, assessmentId, organizationLearnerId } = {}) {
    this.assessmentId = assessmentId;
    this.missionId = missionId;
    this.organizationLearnerId = organizationLearnerId;
  }
}

export { MissionAssessment };
