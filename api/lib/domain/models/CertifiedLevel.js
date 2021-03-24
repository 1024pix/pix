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
