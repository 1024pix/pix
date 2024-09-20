class MissionAssessment {
  constructor({ missionId, assessmentId, organizationLearnerId, result } = {}) {
    this.assessmentId = assessmentId;
    this.missionId = missionId;
    this.organizationLearnerId = organizationLearnerId;
    this.result = new MissionAssessmentResult(result || {});
  }
}

class MissionAssessmentResult {
  constructor({ global, steps, dare } = {}) {
    this.global = global;
    this.steps = steps;
    this.dare = dare;
  }
}

export { MissionAssessment, MissionAssessmentResult };
