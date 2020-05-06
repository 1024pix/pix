class CertificationScoringCompleted {
  constructor({ certificationCourseId, userId, reproducibilityRate, isCertification }) {
    this.certificationCourseId = certificationCourseId;
    this.userId = userId;
    this.reproducibilityRate = reproducibilityRate;
    this.isCertification = isCertification;
  }
}

module.exports = CertificationScoringCompleted;
