export default class NeutralizationAttempt {
  constructor(questionNumber, status) {
    this.questionNumber = questionNumber;
    this.status = status;
  }

  static neutralized(questionNumber) {
    return new NeutralizationAttempt(questionNumber, NeutralizationStatus.NEUTRALIZED);
  }

  static failure(questionNumber) {
    return new NeutralizationAttempt(questionNumber, NeutralizationStatus.FAILURE);
  }

  static skipped(questionNumber) {
    return new NeutralizationAttempt(questionNumber, NeutralizationStatus.SKIPPED);
  }

  hasFailed() {
    return this.status === NeutralizationStatus.FAILURE;
  }

  hasSucceeded() {
    return this.status === NeutralizationStatus.NEUTRALIZED;
  }

  wasSkipped() {
    return this.status === NeutralizationStatus.SKIPPED;
  }
}

const NeutralizationStatus = {
  NEUTRALIZED: 'NEUTRALIZED',
  FAILURE: 'FAILURE',
  SKIPPED: 'SKIPPED',
};
