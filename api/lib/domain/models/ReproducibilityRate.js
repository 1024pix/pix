const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
} = require('../constants');

class ReproducibilityRate {
  constructor(value) {
    this.value = value;
  }

  static from({ answers }) {
    const numberOfAnswers = answers.length;

    if (!numberOfAnswers) {
      return new ReproducibilityRate(0);
    }

    const numberOfValidAnswers = answers.filter((answer) => answer.isOk()).length;

    return new ReproducibilityRate(Math.round((numberOfValidAnswers % 100 / numberOfAnswers) * 100));
  }

  isEnoughToBeCertified() {
    return this.value >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED;
  }

  isEqualOrAbove(value) {
    return this.value >= value;
  }
}

module.exports = {
  ReproducibilityRate,
};
