const some = require('lodash/some');
const every = require('lodash/every');
const { statuses: juryCertificationSummaryStatuses } = require('../read-models/JuryCertificationSummary');

module.exports = class FinalizedSession {
  constructor({
    sessionId,
    finalizedAt,
    certificationCenterName,
    sessionDate,
    sessionTime,
    isPublishable,
  }) {
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
        && _hasNoStartedOrErrorAssessmentResults(juryCertificationSummaries)
        && _hasExaminerSeenAllEndScreens(juryCertificationSummaries),
    });
  }
};

function _hasNoIssueReportsWithRequiredAction(juryCertificationSummaries) {
  return !some(
    juryCertificationSummaries.flatMap((summary) => summary.certificationIssueReports),
    (issueReport) => issueReport.isActionRequired,
  );
}

function _hasNoStartedOrErrorAssessmentResults(juryCertificationSummaries) {
  return !some(
    juryCertificationSummaries,
    (summary) => {
      return summary.status === juryCertificationSummaryStatuses.ERROR
        || summary.status === juryCertificationSummaryStatuses.STARTED;
    },
  );
}

function _hasExaminerSeenAllEndScreens(juryCertificationSummaries) {
  return every(juryCertificationSummaries.map((summary) => summary.hasSeenEndTestScreen));
}
