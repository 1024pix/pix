import { FlashAssessmentSuccessRateHandlerFixedStrategy } from './FlashAssessmentSuccessRateHandlerFixedStrategy.js';
import { FlashAssessmentSuccessRateHandlerLinearStrategy } from './FlashAssessmentSuccessRateHandlerLinearStrategy.js';

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
    if (successRateRange.type === 'linear') {
      return FlashAssessmentSuccessRateHandler.createLinear(successRateRange);
    }
    if (successRateRange.type === 'fixed') {
      return FlashAssessmentSuccessRateHandler.createFixed(successRateRange);
    }
  }

  static createFixed({ startingChallengeIndex, endingChallengeIndex, value }) {
    return new FlashAssessmentSuccessRateHandler({
      startingChallengeIndex,
      endingChallengeIndex,
      strategy: new FlashAssessmentSuccessRateHandlerFixedStrategy({
        value,
      }),
    });
  }

  static createLinear({ startingChallengeIndex, endingChallengeIndex, startingValue, endingValue }) {
    return new FlashAssessmentSuccessRateHandler({
      startingChallengeIndex,
      endingChallengeIndex,
      strategy: new FlashAssessmentSuccessRateHandlerLinearStrategy({
        startingValue,
        endingValue,
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
