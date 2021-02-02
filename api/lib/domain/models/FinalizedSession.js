const some = require('lodash/some');
const every = require('lodash/every');

module.exports = class FinalizedSession {
  constructor({
    sessionId,
    finalizedAt,
    certificationCenterName,
    sessionDate,
    sessionTime,
    isPublishable,
  } = {}) {
    this.sessionId = sessionId;
    this.finalizedAt = finalizedAt;
    this.certificationCenterName = certificationCenterName;
    this.sessionDate = sessionDate;
    this.sessionTime = sessionTime;
    this.isPublishable = isPublishable;
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
      isPublishable: !hasExaminerGlobalComment
        && _hasNoIssueReportsWithRequiredAction(juryCertificationSummaries)
        && _hasNoScoringErrorOrUncompletedAssessmentResults(juryCertificationSummaries)
        && _hasExaminerSeenAllEndScreens(juryCertificationSummaries),
    });
  }
};

function _hasNoIssueReportsWithRequiredAction(juryCertificationSummaries) {
  return !juryCertificationSummaries.some((summary) => summary.isActionRequired());
}

function _hasNoScoringErrorOrUncompletedAssessmentResults(juryCertificationSummaries) {
  return !some(
    juryCertificationSummaries,
    (summary) => {
      return summary.hasScoringError()
        || !summary.hasCompletedAssessment();
    },
  );
}

function _hasExaminerSeenAllEndScreens(juryCertificationSummaries) {
  return every(juryCertificationSummaries.map((summary) => summary.hasSeenEndTestScreen));
}
