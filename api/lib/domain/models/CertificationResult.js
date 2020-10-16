class CertificationResult {
  constructor(
    {
      id,
      lastAssessmentResultFull,
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
    this.resultCreatedAt = lastAssessmentResultFull.createdAt;
    this.isPublished = isPublished;
    this.isV2Certification = isV2Certification;
    this.cleaCertificationStatus = cleaCertificationStatus;
    this.pixScore = lastAssessmentResultFull.pixScore;
    this.status = lastAssessmentResultFull.status;
    this.emitter = lastAssessmentResultFull.emitter;
    this.commentForCandidate = lastAssessmentResultFull.commentForCandidate;
    this.commentForJury = lastAssessmentResultFull.commentForJury;
    this.commentForOrganization = lastAssessmentResultFull.commentForOrganization;
    this.competencesWithMark = lastAssessmentResultFull.competenceMarks;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    // references
    this.assessmentId = assessmentId;
    this.juryId = lastAssessmentResultFull.juryId;
    this.sessionId = sessionId;
  }
}

module.exports = CertificationResult;
