const Assessment = require('./Assessment');

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
      cleaCertificationResult,
      certificationIssueReports,
      hasSeenEndTestScreen,
      assessmentId,
      sessionId,
    } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.externalId = externalId;
    this.completedAt = completedAt;
    this.createdAt = createdAt;
    this.isPublished = isPublished;
    this.isV2Certification = isV2Certification;
    this.cleaCertificationResult = cleaCertificationResult;
    this.certificationIssueReports = certificationIssueReports;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.assessmentId = assessmentId;
    this.sessionId = sessionId;

    if (lastAssessmentResult) {
      this.resultCreatedAt = lastAssessmentResult.createdAt;
      this.pixScore = lastAssessmentResult.pixScore;
      this.status = lastAssessmentResult.status;
      this.emitter = lastAssessmentResult.emitter;
      this.commentForCandidate = lastAssessmentResult.commentForCandidate;
      this.commentForJury = lastAssessmentResult.commentForJury;
      this.commentForOrganization = lastAssessmentResult.commentForOrganization;
      this.competencesWithMark = lastAssessmentResult.competenceMarks;
      this.juryId = lastAssessmentResult.juryId;
    } else {
      this.resultCreatedAt = undefined;
      this.pixScore = undefined;
      this.status = Assessment.states.STARTED;
      this.emitter = undefined;
      this.commentForCandidate = undefined;
      this.commentForJury = undefined;
      this.commentForOrganization = undefined;
      this.competencesWithMark = [];
      this.juryId = undefined;
    }
  }
}

module.exports = CertificationResult;
