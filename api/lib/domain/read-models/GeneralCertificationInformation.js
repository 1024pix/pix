class GeneralCertificationInformation {
  constructor({
    certificationCourseId,

    sessionId,
    createdAt,
    completedAt,
    isPublished,
    isCancelled,

    firstName,
    lastName,
    birthdate,
    birthplace,

    certificationIssueReports,
  }) {
    this.certificationCourseId = certificationCourseId;

    this.sessionId = sessionId;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.isCancelled = isCancelled;

    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.certificationIssueReports = certificationIssueReports;
  }
}

module.exports = GeneralCertificationInformation;
