class AutoJuryDone {
  constructor({
    sessionId,
    finalizedAt,
    certificationCenterName,
    sessionDate,
    sessionTime,
    hasExaminerGlobalComment,
    version,
  }) {
    this.sessionId = sessionId;
    this.finalizedAt = finalizedAt;
    this.certificationCenterName = certificationCenterName;
    this.sessionDate = sessionDate;
    this.sessionTime = sessionTime;
    this.hasExaminerGlobalComment = hasExaminerGlobalComment;
    this.version = version;
  }
}

export { AutoJuryDone };
