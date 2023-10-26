class MissionAssessment {
  constructor({ missionId, assessmentId, createdAt } = {}) {
    this.assessmentId = assessmentId;
    this.missionId = missionId;
    this.createdAt = createdAt;
  }
}

export { MissionAssessment };
