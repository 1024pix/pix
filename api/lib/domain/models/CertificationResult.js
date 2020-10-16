class CertificationResult {
  constructor(
    {
      id,
      lastAssessmentResult,
      firstName,
      lastName,
      birthplace,
      birthdate,
      externalId,
      completedAt,
      createdAt,
      isPublished,
      isV2Certification,
      cleaCertificationStatus,
      examinerComment,
      hasSeenEndTestScreen,
      assessmentId,
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
    this.resultCreatedAt = lastAssessmentResult.createdAt;
    this.isPublished = isPublished;
    this.isV2Certification = isV2Certification;
    this.cleaCertificationStatus = cleaCertificationStatus;
    this.pixScore = lastAssessmentResult.pixScore;
    this.status = lastAssessmentResult.status;
    this.emitter = lastAssessmentResult.emitter;
    this.commentForCandidate = lastAssessmentResult.commentForCandidate;
    this.commentForJury = lastAssessmentResult.commentForJury;
    this.commentForOrganization = lastAssessmentResult.commentForOrganization;
    this.competencesWithMark = lastAssessmentResult.competenceMarks;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    // references
    this.assessmentId = assessmentId;
    this.juryId = lastAssessmentResult.juryId;
    this.sessionId = sessionId;
  }
}

module.exports = CertificationResult;
