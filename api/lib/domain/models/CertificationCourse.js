class CertificationCourse {
  constructor(
    {
      id,
      firstName,
      lastName,
      birthdate,
      birthplace,
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
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthplace = birthplace;
    this.birthdate = birthdate;
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
    this.isCancelled = isCancelled;
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
      birthplace: certificationCandidate.birthCity,
      externalId: certificationCandidate.externalId,
      isV2Certification: true,
      challenges,
      verificationCode,
      maxReachableLevelOnCertificationDate,
    });
  }
}

module.exports = CertificationCourse;
