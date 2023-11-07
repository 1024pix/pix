export class FlashAssessmentSuccessRateHandlerLinearStrategy {
  constructor({ startingValue, endingValue }) {
    this.startingValue = startingValue;
    this.endingValue = endingValue;
  }

  // Computes a linear success rate variation between startingChallengeIndex and endingChallengeIndex
  // It varies from this.startingValue to this.endingValue
  getMinimalSuccessRate(startingChallengeIndex, endingChallengeIndex, challengeIndex) {
    const successRateSlope = (this.endingValue - this.startingValue) / (endingChallengeIndex - startingChallengeIndex);

    return this.startingValue + successRateSlope * (challengeIndex - startingChallengeIndex);
  }
}
