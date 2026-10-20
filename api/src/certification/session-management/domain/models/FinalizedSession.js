class FinalizedSession {
  constructor({
    sessionId,
    finalizedAt,
    certificationCenterName,
    sessionDate,
    sessionTime,
    isPublishable,
    publishedAt,
    assignedCertificationOfficerName,
  } = {}) {
    this.sessionId = sessionId;
    this.finalizedAt = finalizedAt;
    this.certificationCenterName = certificationCenterName;
    this.sessionDate = sessionDate;
    this.sessionTime = sessionTime;
    this.isPublishable = isPublishable;
    this.publishedAt = publishedAt;
    this.assignedCertificationOfficerName = assignedCertificationOfficerName;
  }

  static from({
    sessionId,
    finalizedAt,
    certificationCenterName,
    sessionDate,
    sessionTime,
    hasExaminerGlobalComment,
    juryCertificationSummaries,
  }) {
    return new FinalizedSession({
      sessionId,
      finalizedAt,
      certificationCenterName,
      sessionDate,
      sessionTime,
      isPublishable:
        !hasExaminerGlobalComment &&
        _hasNoIssueReportsWithRequiredAction(juryCertificationSummaries) &&
        _hasNoScoringError(juryCertificationSummaries),
      publishedAt: null,
    });
  }

  publish() {
    this.publishedAt = new Date();
  }

  unpublish() {
    this.publishedAt = null;
  }

  assignCertificationOfficer({ certificationOfficerName }) {
    this.isPublishable = false;
    this.assignedCertificationOfficerName = certificationOfficerName;
  }
}

export { FinalizedSession };

function _hasNoIssueReportsWithRequiredAction(juryCertificationSummaries) {
  return !juryCertificationSummaries.some((summary) => summary.isActionRequired());
}

function _hasNoScoringError(juryCertificationSummaries) {
  return juryCertificationSummaries.every((summary) => !summary.hasScoringError());
}
