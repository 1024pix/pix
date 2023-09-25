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
}

export { FlashAssessmentSuccessRateHandler };
