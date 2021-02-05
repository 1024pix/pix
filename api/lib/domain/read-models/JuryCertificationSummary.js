const { status: assessmentResultStatuses } = require('../models/AssessmentResult');

const STARTED = 'started';

const ACQUIRED = true;
const REJECTED = false;
const NOT_PASSED = null;

const statuses = {
  [ACQUIRED]: 'acquired',
  [REJECTED]: 'rejected',
  [NOT_PASSED]: 'not_passed',
};

class JuryCertificationSummary {
  constructor({
    id,
    firstName,
    lastName,
    status,
    pixScore,
    createdAt,
    completedAt,
    isPublished,
    hasSeenEndTestScreen,
    cleaCertificationStatus,
    certificationIssueReports,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = status;
    if (!Object.values(assessmentResultStatuses).includes(this.status)) {
      this.status = STARTED;
    }
    this.pixScore = pixScore;
    this.cleaCertificationStatus = statuses[cleaCertificationStatus];
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.certificationIssueReports = certificationIssueReports;
  }

  isActionRequired() {
    return this.certificationIssueReports.some((issueReport) => issueReport.isActionRequired);
  }

  hasScoringError() {
    return this.status === JuryCertificationSummary.statuses.ERROR;
  }

  hasCompletedAssessment() {
    return this.status !== JuryCertificationSummary.statuses.STARTED;
  }
}

module.exports = JuryCertificationSummary;
module.exports.statuses = { ...assessmentResultStatuses, STARTED };
