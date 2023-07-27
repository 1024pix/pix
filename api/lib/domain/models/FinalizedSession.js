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
    version = 2,
  } = {}) {
    this.sessionId = sessionId;
    this.finalizedAt = finalizedAt;
    this.certificationCenterName = certificationCenterName;
    this.sessionDate = sessionDate;
    this.sessionTime = sessionTime;
    this.isPublishable = isPublishable;
    this.publishedAt = publishedAt;
    this.assignedCertificationOfficerName = assignedCertificationOfficerName;
    this.version = version;
  }

  static from({
    sessionId,
    finalizedAt,
    certificationCenterName,
    sessionDate,
    sessionTime,
    hasExaminerGlobalComment,
    juryCertificationSummaries,
    hasSupervisorAccess,
    version,
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
        _hasNoScoringError(juryCertificationSummaries) &&
        _hasNoUnfinishedWithoutAbortReason(juryCertificationSummaries) &&
        _hasAllFinishedEndTestScreensSeenByExaminer(hasSupervisorAccess, juryCertificationSummaries),
      publishedAt: null,
      version,
    });
  }

  publish(now) {
    this.publishedAt = now;
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
  return !juryCertificationSummaries.some((summary) => {
    return summary.hasScoringError();
  });
}

function _hasNoUnfinishedWithoutAbortReason(juryCertificationSummaries) {
  return juryCertificationSummaries
    .filter((certificationSummary) => !certificationSummary.completedAt)
    .every((unfinishedCertificationSummary) => unfinishedCertificationSummary.isFlaggedAborted);
}

function _hasAllFinishedEndTestScreensSeenByExaminer(hasSupervisorAccess, juryCertificationSummaries) {
  if (hasSupervisorAccess) return true;
  return juryCertificationSummaries
    .filter((certificationSummary) => Boolean(certificationSummary.completedAt))
    .every((finishedCertificationSummary) => finishedCertificationSummary.hasSeenEndTestScreen);
}
