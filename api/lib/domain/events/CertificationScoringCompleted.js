class CertificationScoringCompleted {
  constructor({ certificationCourseId, userId, reproducibilityRate, isValidated }) {
    this.certificationCourseId = certificationCourseId;
    this.userId = userId;
    this.reproducibilityRate = reproducibilityRate;
    this.isValidated = isValidated;
  }
}

module.exports = CertificationScoringCompleted;
