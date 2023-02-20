import { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED } from '../constants';

class ReproducibilityRate {
  constructor(value) {
    this.value = value;
  }

  static from({ numberOfNonNeutralizedChallenges, numberOfCorrectAnswers }) {
    if (numberOfNonNeutralizedChallenges === 0) return new ReproducibilityRate(0);
    return new ReproducibilityRate(Math.round((numberOfCorrectAnswers / numberOfNonNeutralizedChallenges) * 100));
  }

  isEnoughToBeCertified() {
    return this.value >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED;
  }

  isEqualOrAbove(value) {
    return this.value >= value;
  }
}

export default {
  ReproducibilityRate,
};
