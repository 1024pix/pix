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
      acquiredPartnerCertifications,
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
    this.acquiredPartnerCertifications = acquiredPartnerCertifications;
    // references
    this.userId = userId;
    this.sessionId = sessionId;
  }
}

module.exports = CertificationCourse;
