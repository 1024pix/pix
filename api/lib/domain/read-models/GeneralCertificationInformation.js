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
    birthCountry,
    birthPostalCode,
    birthINSEECode,
    sex,
    userId,

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
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.birthCountry = birthCountry;
    this.sex = sex;
    this.userId = userId;

    this.certificationIssueReports = certificationIssueReports;
  }
}

export default GeneralCertificationInformation;
