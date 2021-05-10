const status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  STARTED: 'started',
};

class CertificationResult {
  constructor({
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
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports,
    hasSeenEndTestScreen,
    assessmentId,
    sessionId,
    isCourseCancelled,
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
    this.pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreCertificationResult;
    this.pixPlusDroitExpertCertificationResult = pixPlusDroitExpertCertificationResult;
    this.certificationIssueReports = certificationIssueReports;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.assessmentId = assessmentId;
    this.sessionId = sessionId;
    this.status = _getStatus(lastAssessmentResult, isCourseCancelled);

    if (lastAssessmentResult) {
      this.resultCreatedAt = lastAssessmentResult.createdAt;
      this.pixScore = lastAssessmentResult.pixScore;
      this.emitter = lastAssessmentResult.emitter;
      this.commentForCandidate = lastAssessmentResult.commentForCandidate;
      this.commentForJury = lastAssessmentResult.commentForJury;
      this.commentForOrganization = lastAssessmentResult.commentForOrganization;
      this.competencesWithMark = lastAssessmentResult.competenceMarks;
      this.juryId = lastAssessmentResult.juryId;
    } else {
      this.resultCreatedAt = undefined;
      this.pixScore = undefined;
      this.emitter = undefined;
      this.commentForCandidate = undefined;
      this.commentForJury = undefined;
      this.commentForOrganization = undefined;
      this.competencesWithMark = [];
      this.juryId = undefined;
    }
  }

  isCancelled() {
    return this.status === status.CANCELLED;
  }

  hasTakenClea() {
    return this.cleaCertificationResult.isTaken();
  }

  hasTakenPixPlusDroitMaitre() {
    return this.pixPlusDroitMaitreCertificationResult.isTaken();
  }

  hasTakenPixPlusDroitExpert() {
    return this.pixPlusDroitExpertCertificationResult.isTaken();
  }
}

function _getStatus(lastAssessmentResult, isCourseCancelled) {
  if (isCourseCancelled) {
    return status.CANCELLED;
  }

  return lastAssessmentResult?.status ?? status.STARTED;
}

module.exports = CertificationResult;
CertificationResult.status = status;
