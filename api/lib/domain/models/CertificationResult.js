class CertificationResult {
  constructor(
    {
      id,
      // attributes
      firstName,
      lastName,
      birthplace,
      birthdate,
      externalId,
      completedAt,
      createdAt,
      resultCreatedAt,
      isPublished,
      isV2Certification,
      pixScore,
      status,
      level,
      emitter,
      commentForCandidate,
      commentForJury,
      commentForOrganization,
      competencesWithMark,
      examinerComment,
      hasSeenEndTestScreen,
      // references
      assessmentId,
      juryId,
      sessionId,
    } = {}) {
    this.id = id;
    // attributes
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.externalId = externalId;
    this.completedAt = completedAt;
    this.createdAt = createdAt;
    this.resultCreatedAt = resultCreatedAt;
    this.isPublished = isPublished;
    this.isV2Certification = isV2Certification;
    this.pixScore = pixScore;
    this.status = status;
    this.level = level;
    this.emitter = emitter;
    this.commentForCandidate = commentForCandidate;
    this.commentForJury = commentForJury;
    this.commentForOrganization = commentForOrganization;
    this.competencesWithMark = competencesWithMark;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    // references
    this.assessmentId = assessmentId;
    this.juryId = juryId;
    this.sessionId = sessionId;
  }
}

module.exports = CertificationResult;
