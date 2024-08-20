export class CertificationCompletedJob {
  constructor({ assessmentId, userId, certificationCourseId, locale }) {
    this.assessmentId = assessmentId;
    this.userId = userId;
    this.certificationCourseId = certificationCourseId;
    this.locale = locale;
  }
}
