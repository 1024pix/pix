module.exports = class SessionFinalized {
  constructor({
    sessionId,
    finalizedAt,
    hasExaminerGlobalComment,
  }) {
    this.sessionId = sessionId;
    this.finalizedAt = finalizedAt;
    this.hasExaminerGlobalComment = hasExaminerGlobalComment;
  }
};
