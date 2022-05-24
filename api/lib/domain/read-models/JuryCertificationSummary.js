const { status: assessmentResultStatuses } = require('../models/AssessmentResult');
const { getLabelByBadgeKey } = require('./CertifiableBadgeLabels');
const STARTED = 'started';
const CANCELLED = 'cancelled';
const ENDED_BY_SUPERVISOR = 'endedBySupervisor';

class JuryCertificationSummary {
  constructor({
    id,
    firstName,
    lastName,
    status,
    pixScore,
    createdAt,
    completedAt,
    abortReason,
    isPublished,
    isCourseCancelled,
    isEndedBySupervisor,
    hasSeenEndTestScreen,
    complementaryCertificationCourseResults,
    certificationIssueReports,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = _getStatus(status, isCourseCancelled, isEndedBySupervisor);
    this.pixScore = pixScore;
    this.isFlaggedAborted = Boolean(abortReason) && !completedAt;
    this.complementaryCertificationTakenLabels = this._buildLabels(complementaryCertificationCourseResults);
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.certificationIssueReports = certificationIssueReports;
  }

  isActionRequired() {
    return this.certificationIssueReports.some((issueReport) => issueReport.isImpactful && !issueReport.isResolved());
  }

  hasScoringError() {
    return this.status === JuryCertificationSummary.statuses.ERROR;
  }

  hasCompletedAssessment() {
    return this.status !== JuryCertificationSummary.statuses.STARTED;
  }

  _buildLabels(complementaryCertificationCourseResults) {
    return complementaryCertificationCourseResults
      ?.filter((complementaryCertificationCourseResult) => complementaryCertificationCourseResult.isFromPixSource())
      .map(({ partnerKey }) => getLabelByBadgeKey(partnerKey));
  }
}

function _getStatus(status, isCourseCancelled, isEndedBySupervisor) {
  if (isCourseCancelled) {
    return CANCELLED;
  }

  if (isEndedBySupervisor) {
    return ENDED_BY_SUPERVISOR;
  }

  if (!Object.values(assessmentResultStatuses).includes(status)) {
    return STARTED;
  }

  return status;
}

module.exports = JuryCertificationSummary;
module.exports.statuses = { ...assessmentResultStatuses, STARTED, ENDED_BY_SUPERVISOR };
