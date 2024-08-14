export class CertificationCompletedJob {
  constructor({ assessmentId, userId, certificationCourseId, locale }) {
    this.assessmentId = assessmentId;
    this.userId = userId;
    this.certificationCourseId = certificationCourseId;
    this.locale = locale;
  }

  // @deprecated : event is not sent without this anymore
  // @see /lib/domain/events/handle-certification-scoring.js
  //      in handler to remove the 'if' in
  get isCertificationType() {
    return Boolean(this.certificationCourseId);
  }
}
