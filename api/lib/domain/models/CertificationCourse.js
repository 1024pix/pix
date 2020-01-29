class CertificationCourse {
  constructor(
    {
      id,
      // attributes
      birthplace,
      birthdate,
      completedAt,
      createdAt,
      externalId,
      firstName,
      isPublished = false,
      lastName,
      isV2Certification = false,
      examinerComment,
      hasSeenEndTestScreen,
      // includes
      assessment,
      challenges,
      // references
      userId,
      sessionId,
    } = {}) {
    this.id = id;
    // attributes
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.completedAt = completedAt;
    this.createdAt = createdAt;
    this.externalId = externalId;
    this.firstName = firstName;
    this.isPublished = isPublished;
    this.lastName = lastName;
    this.isV2Certification = isV2Certification;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    // includes
    this.assessment = assessment;
    this.challenges = challenges;
    // references
    this.userId = userId;
    this.sessionId = sessionId;
  }

}

module.exports = CertificationCourse;
