class CertificationRescoringCompleted {
  constructor({ certificationCourseId, userId, reproducibilityRate }) {
    this.certificationCourseId = certificationCourseId;
    this.userId = userId;
    this.reproducibilityRate = reproducibilityRate;
  }
}

module.exports = CertificationRescoringCompleted;
