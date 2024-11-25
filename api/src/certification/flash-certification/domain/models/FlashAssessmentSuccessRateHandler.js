import { FlashAssessmentSuccessRateHandlerFixedStrategy } from './FlashAssessmentSuccessRateHandlerFixedStrategy.js';

class FlashAssessmentSuccessRateHandler {
  constructor({ startingChallengeIndex, endingChallengeIndex, strategy }) {
    this.startingChallengeIndex = startingChallengeIndex;
    this.endingChallengeIndex = endingChallengeIndex;
    this._strategy = strategy;
  }

  isApplicable(questionIndex) {
    return this.startingChallengeIndex <= questionIndex && this.endingChallengeIndex >= questionIndex;
  }

  getMinimalSuccessRate(questionIndex) {
    return this._strategy.getMinimalSuccessRate(this.startingChallengeIndex, this.endingChallengeIndex, questionIndex);
  }

  static create(successRateRange) {
    const { startingChallengeIndex, endingChallengeIndex, value } = successRateRange;
    return new FlashAssessmentSuccessRateHandler({
      startingChallengeIndex,
      endingChallengeIndex,
      strategy: new FlashAssessmentSuccessRateHandlerFixedStrategy({
        value,
      }),
    });
  }

  toDTO() {
    return {
      startingChallengeIndex: this.startingChallengeIndex,
      endingChallengeIndex: this.endingChallengeIndex,
      ...this._strategy.toDTO(),
    };
  }

  static fromDTO(config) {
    return FlashAssessmentSuccessRateHandler.create(config);
  }
}

export { FlashAssessmentSuccessRateHandler };
