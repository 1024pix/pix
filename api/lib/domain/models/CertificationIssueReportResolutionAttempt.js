module.exports = class CertificationIssueReportResolutionAttempt {
  constructor(status) {
    this.status = status;
  }

  static succeeded() {
    return new CertificationIssueReportResolutionAttempt(ResolutionStatus.SUCCEEDED);
  }

  static failure() {
    return new CertificationIssueReportResolutionAttempt(ResolutionStatus.FAILURE);
  }

  hasFailed() {
    return this.status === ResolutionStatus.FAILURE;
  }

  hasSucceeded() {
    return this.status === ResolutionStatus.SUCCEEDED;
  }
};

const ResolutionStatus = {
  SUCCEEDED: 'SUCCEEDED',
  FAILURE: 'FAILURE',
};
