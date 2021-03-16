const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
  UNCERTIFIED_LEVEL,
} = require('../constants');

class CertifiedLevel {
  constructor({ value, status }) {
    this.value = value;
    this.status = status;
  }

  static from({
    numberOfChallengesAnswered,
    numberOfCorrectAnswers,
    estimatedLevel,
    reproducibilityRate,
  }) {
    if (numberOfChallengesAnswered === 3) {
      return CertifiedLevel._for3Challenges({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate });
    } else if (numberOfChallengesAnswered === 2) {
      return CertifiedLevel._for2Challenges({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate });
    } else {
      return CertifiedLevel._for1Challenge({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate });
    }
  }

  static _for3Challenges({
    numberOfCorrectAnswers,
    estimatedLevel,
    reproducibilityRate,
  }) {
    if (numberOfCorrectAnswers < 2) {
      return this.uncertify();
    }
    if (reproducibilityRate < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED && numberOfCorrectAnswers === 2) {
      return this.downgrade(estimatedLevel);
    }
    return this.validate(estimatedLevel);
  }

  static _for2Challenges({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate }) {
    if (numberOfCorrectAnswers === 2) {
      return this.validate(estimatedLevel);
    } else if (numberOfCorrectAnswers === 1) {
      if (reproducibilityRate >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED) {
        return this.validate(estimatedLevel);
      } else if (reproducibilityRate >= 70) {
        return this.downgrade(estimatedLevel);
      } else {
        return this.uncertify();
      }
    }
    return this.uncertify();
  }

  static _for1Challenge({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate }) {
    if (numberOfCorrectAnswers === 1) {
      if (reproducibilityRate >= 70) {
        return this.validate(estimatedLevel);
      } else {
        return this.downgrade(estimatedLevel);
      }
    }
    return this.uncertify();
  }

  static uncertify() {
    return new CertifiedLevel({ value: UNCERTIFIED_LEVEL, status: statuses.UNCERTIFIED });
  }

  static downgrade(estimatedLevel) {
    return new CertifiedLevel({ value: estimatedLevel - 1, status: statuses.DOWNGRADED });
  }

  static validate(estimatedLevel) {
    return new CertifiedLevel({ value: estimatedLevel, status: statuses.VALIDATED });
  }

  isDowngraded() {
    return this.status === statuses.DOWNGRADED;
  }

  isUncertified() {
    return this.status === statuses.UNCERTIFIED;
  }
}

const statuses = {
  DOWNGRADED: 'DOWNGRADED',
  UNCERTIFIED: 'UNCERTIFIED',
  VALIDATED: 'VALIDATED',
};

module.exports = {
  CertifiedLevel,
};
