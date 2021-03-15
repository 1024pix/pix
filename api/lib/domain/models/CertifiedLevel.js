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
      return this._scoreFor3Challenges({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate });
    } else if (numberOfChallengesAnswered === 2) {
      return this._scoreFor2Challenges({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate });
    } else {
      return this._scoreFor1Challenge({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate });
    }
  }

  static _scoreFor3Challenges({
    numberOfCorrectAnswers,
    estimatedLevel,
    reproducibilityRate,
  }) {
    if (numberOfCorrectAnswers < 2) {
      return this.uncertified();
    }
    if (reproducibilityRate < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED && numberOfCorrectAnswers === 2) {
      return this.downgraded(estimatedLevel);
    }
    return this.validated(estimatedLevel);
  }

  static _scoreFor2Challenges({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate }) {
    if (numberOfCorrectAnswers === 2) {
      return this.validated(estimatedLevel);
    } else if (numberOfCorrectAnswers === 1) {
      if (reproducibilityRate >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED) {
        return this.validated(estimatedLevel);
      } else if (reproducibilityRate >= 70) {
        return this.downgraded(estimatedLevel);
      } else {
        return this.uncertified();
      }
    }
    return this.uncertified();
  }

  static _scoreFor1Challenge({ numberOfCorrectAnswers, estimatedLevel, reproducibilityRate }) {
    if (numberOfCorrectAnswers === 1) {
      if (reproducibilityRate >= 70) {
        return this.validated(estimatedLevel);
      } else {
        return this.downgraded(estimatedLevel);
      }
    }
    return this.uncertified();
  }

  static uncertified() {
    return new CertifiedLevel({ value: UNCERTIFIED_LEVEL, status: statuses.UNCERTIFIED });
  }

  static downgraded(estimatedLevel) {
    return new CertifiedLevel({ value: estimatedLevel - 1, status: statuses.DOWNGRADED });
  }

  static validated(estimatedLevel) {
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
