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
      // includes
      assessment,
      challenges,
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
    // includes
    this.assessment = assessment;
    this.challenges = challenges;
    // references
    this.userId = userId;
    this.sessionId = sessionId;
  }

  static from({ certificationProfile, certificationCandidate, certificationChallenges }) {
    return new CertificationCourse({
      userId: certificationCandidate.userId,
      sessionId: certificationCandidate.sessionId,
      firstName:certificationCandidate.firstName,
      lastName: certificationCandidate.lastName,
      birthdate:certificationCandidate.birthdate,
      birthplace:certificationCandidate.birthCity,
      externalId:certificationCandidate.externalId,
      isV2Certification: true,
    });
  }
}

module.exports = CertificationCourse;
