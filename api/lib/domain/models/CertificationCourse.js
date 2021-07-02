class CertificationCourse {
  constructor(
    {
      id,
      firstName,
      lastName,
      birthdate,
      birthplace,
      birthPostalCode,
      birthINSEECode,
      sex,
      externalId,
      hasSeenEndTestScreen,
      createdAt,
      completedAt,
      isPublished = false,
      isV2Certification = false,
      verificationCode,
      assessment,
      challenges,
      certificationIssueReports,
      userId,
      sessionId,
      maxReachableLevelOnCertificationDate,
      isCancelled = false,
    } = {}) {
    this.id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._birthdate = birthdate;
    this._birthplace = birthplace;
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.sex = sex;
    this.externalId = externalId;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.isV2Certification = isV2Certification;
    this.verificationCode = verificationCode;
    this.assessment = assessment;
    this.challenges = challenges;
    this.certificationIssueReports = certificationIssueReports;
    this.userId = userId;
    this.sessionId = sessionId;
    this.maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this._isCancelled = isCancelled;
  }

  reportIssue(issueReport) {
    this.certificationIssueReports.push(issueReport);
  }

  static from({ certificationCandidate, challenges, verificationCode, maxReachableLevelOnCertificationDate }) {
    return new CertificationCourse({
      userId: certificationCandidate.userId,
      sessionId: certificationCandidate.sessionId,
      firstName: certificationCandidate.firstName,
      lastName: certificationCandidate.lastName,
      birthdate: certificationCandidate.birthdate,
      birthPostalCode: certificationCandidate.birthPostalCode,
      birthINSEECode: certificationCandidate.birthINSEECode,
      sex: certificationCandidate.sex,
      birthplace: certificationCandidate.birthCity,
      externalId: certificationCandidate.externalId,
      isV2Certification: true,
      challenges,
      verificationCode,
      maxReachableLevelOnCertificationDate,
    });
  }

  cancel() {
    this._isCancelled = true;
  }

  isCancelled() {
    return this._isCancelled === true;
  }

  birthdate() {
    return this._birthdate;
  }

  firstName() {
    return this._firstName;
  }

  lastName() {
    return this._lastName;
  }

  birthplace() {
    return this._birthplace;
  }
}

module.exports = CertificationCourse;
