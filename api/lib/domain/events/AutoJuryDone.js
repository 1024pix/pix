export default class AutoJuryDone {
  constructor({ sessionId, finalizedAt, certificationCenterName, sessionDate, sessionTime, hasExaminerGlobalComment }) {
    this.sessionId = sessionId;
    this.finalizedAt = finalizedAt;
    this.certificationCenterName = certificationCenterName;
    this.sessionDate = sessionDate;
    this.sessionTime = sessionTime;
    this.hasExaminerGlobalComment = hasExaminerGlobalComment;
  }
}
