export default class CertificationAnswerStatusChangeAttempt {
  constructor(questionNumber, status) {
    this.questionNumber = questionNumber;
    this.status = status;
  }

  static changed(questionNumber) {
    return new CertificationAnswerStatusChangeAttempt(questionNumber, CertificationAnswerStatusChangeStatus.CHANGED);
  }

  static failed(questionNumber) {
    return new CertificationAnswerStatusChangeAttempt(questionNumber, CertificationAnswerStatusChangeStatus.FAILURE);
  }

  static skipped(questionNumber) {
    return new CertificationAnswerStatusChangeAttempt(questionNumber, CertificationAnswerStatusChangeStatus.SKIPPED);
  }

  hasFailed() {
    return this.status === CertificationAnswerStatusChangeStatus.FAILURE;
  }

  hasSucceeded() {
    return this.status === CertificationAnswerStatusChangeStatus.CHANGED;
  }

  wasSkipped() {
    return this.status === CertificationAnswerStatusChangeStatus.SKIPPED;
  }
}

const CertificationAnswerStatusChangeStatus = {
  CHANGED: 'CHANGED',
  FAILURE: 'FAILURE',
  SKIPPED: 'SKIPPED',
};
