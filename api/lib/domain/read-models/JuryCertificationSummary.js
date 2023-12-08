import { status as assessmentResultStatuses } from '../../../src/shared/domain/models/AssessmentResult.js';
const STARTED = 'started';
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
    isCancelled,
    isEndedBySupervisor,
    hasSeenEndTestScreen,
    complementaryCertificationTakenLabel,
    certificationIssueReports,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = _getStatus({ status, isEndedBySupervisor });
    this.isCancelled = isCancelled;
    this.pixScore = pixScore;
    this.isFlaggedAborted = Boolean(abortReason) && !completedAt;
    this.complementaryCertificationTakenLabel = complementaryCertificationTakenLabel;
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
}

function _getStatus({ status, isEndedBySupervisor }) {
  if (isEndedBySupervisor) {
    return ENDED_BY_SUPERVISOR;
  }

  if (!Object.values(assessmentResultStatuses).includes(status)) {
    return STARTED;
  }

  return status;
}
const statuses = { ...assessmentResultStatuses, STARTED, ENDED_BY_SUPERVISOR };

JuryCertificationSummary.statuses = statuses;

export { JuryCertificationSummary, statuses };
