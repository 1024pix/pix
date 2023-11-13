class SessionFinalized {
  constructor({ sessionId, finalizedAt, hasExaminerGlobalComment, sessionDate, sessionTime, certificationCenterName }) {
    this.sessionId = sessionId;
    this.finalizedAt = finalizedAt;
    this.hasExaminerGlobalComment = hasExaminerGlobalComment;
    this.sessionDate = sessionDate;
    this.sessionTime = sessionTime;
    this.certificationCenterName = certificationCenterName;
  }
}

export { SessionFinalized };
