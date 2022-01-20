module.exports = class FlashAssessmentResult {
  constructor({ id, assessmentId, estimatedLevel, errorRate }) {
    this.id = id;
    this.assessmentId = assessmentId;
    this.estimatedLevel = estimatedLevel;
    this.errorRate = errorRate;
  }
};
