class CertificationCourse {
  constructor(
    {
      id,
      // attributes
      firstName,
      lastName,
      birthdate,
      birthplace,
      externalId,
      examinerComment,
      hasSeenEndTestScreen,
      createdAt,
      completedAt,
      isPublished = false,
      isV2Certification = false,
      verificationCode,
      // includes
      assessment,
      challenges,
      certificationIssueReports,
      // references
      userId,
      sessionId,
    } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.externalId = externalId;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.isV2Certification = isV2Certification;
    this.verificationCode = verificationCode;
    // includes
    this.assessment = assessment;
    this.challenges = challenges;
    this.certificationIssueReports = certificationIssueReports;
    // references
    this.userId = userId;
    this.sessionId = sessionId;
  }

  static from({ certificationCandidate, challenges, verificationCode }) {
    return new CertificationCourse({
      userId: certificationCandidate.userId,
      sessionId: certificationCandidate.sessionId,
      firstName:certificationCandidate.firstName,
      lastName: certificationCandidate.lastName,
      birthdate:certificationCandidate.birthdate,
      birthplace:certificationCandidate.birthCity,
      externalId:certificationCandidate.externalId,
      isV2Certification: true,
      challenges,
      verificationCode,
    });
  }
}

module.exports = CertificationCourse;
