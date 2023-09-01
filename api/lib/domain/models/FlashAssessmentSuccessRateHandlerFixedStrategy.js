export class FlashAssessmentSuccessRateHandlerFixedStrategy {
  constructor({ value }) {
    this.value = value;
  }

  getMinimalSuccessRate() {
    return this.value;
  }
}
