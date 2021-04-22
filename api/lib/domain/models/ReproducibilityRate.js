const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
} = require('../constants');

class ReproducibilityRate {
  constructor(value) {
    this.value = value;
  }

  static from({
    numberOfNonNeutralizedChallenges,
    numberOfCorrectAnswers,
  }) {
    if (numberOfNonNeutralizedChallenges === 0) return new ReproducibilityRate(0);
    return new ReproducibilityRate(Math.round((numberOfCorrectAnswers / numberOfNonNeutralizedChallenges) * 100));
  }

  static fromAnswers({ answers }) {
    const numberOfAnswers = answers.length;

    if (!numberOfAnswers) {
      return new ReproducibilityRate(0);
    }

    const numberOfCorrectAnswers = answers.filter((answer) => answer.isOk()).length;

    return new ReproducibilityRate(Math.round((numberOfCorrectAnswers / numberOfAnswers) * 100));
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
