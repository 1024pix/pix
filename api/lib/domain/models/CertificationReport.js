class CertificationReport {
  constructor(
    {
      // attributes
      firstName,
      lastName,
      examinerComment,
      hasSeenEndTestScreen,
      // references
      certificationCourseId,
    } = {}) {
    this.id = CertificationReport.idFromCertificationCourseId(certificationCourseId);
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    // references
    this.certificationCourseId = certificationCourseId;
  }

  static fromCertificationCourse(certificationCourse) {
    return new CertificationReport({
      certificationCourseId: certificationCourse.id,
      firstName: certificationCourse.firstName,
      lastName: certificationCourse.lastName,
      examinerComment: certificationCourse.examinerComment,
      hasSeenEndTestScreen: certificationCourse.hasSeenEndTestScreen,
    });
  }

  static idFromCertificationCourseId(certificationCourseId) {
    return `CertificationReport:${certificationCourseId}`;
  }
}

module.exports = CertificationReport;
