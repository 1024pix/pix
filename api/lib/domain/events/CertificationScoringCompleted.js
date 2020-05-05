class CertificationScoringCompleted {
  constructor({ certificationCourseId, limitDate, userId, reproducibilityRate, }) {
    this.certificationCourseId = certificationCourseId;
    this.limitDate = limitDate;
    this.userId = userId;
    this.reproducibilityRate = reproducibilityRate;
  }
}

module.exports = CertificationScoringCompleted;
