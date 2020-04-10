class CertificationScoringCompleted {
  constructor({ certificationCourseId, userId, percentageCorrectAnswers, isCertification }) {
    this.certificationCourseId = certificationCourseId;
    this.userId = userId;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
    this.isCertification = isCertification;
  }
}

module.exports = CertificationScoringCompleted;
