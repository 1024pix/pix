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
    numberOfNeutralizedAnswers,
    numberOfCorrectAnswers,
    estimatedLevel,
    reproducibilityRate,
  }) {
    if (numberOfChallengesAnswered === 3) {
      return CertifiedLevel._for3Challenges({ numberOfCorrectAnswers, numberOfNeutralizedAnswers, estimatedLevel, reproducibilityRate });
    } else if (numberOfChallengesAnswered === 2) {
      return CertifiedLevel._for2Challenges({ numberOfCorrectAnswers, numberOfNeutralizedAnswers, estimatedLevel, reproducibilityRate });
    } else {
      return CertifiedLevel._for1Challenge({ numberOfCorrectAnswers, numberOfNeutralizedAnswers, estimatedLevel, reproducibilityRate });
    }
  }

  static _for3Challenges({
    numberOfCorrectAnswers,
    numberOfNeutralizedAnswers,
    estimatedLevel,
    reproducibilityRate,
  }) {
    if (numberOfCorrectAnswers < 2) {
      if (numberOfNeutralizedAnswers === 1) {
        if (reproducibilityRate >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED) {
          return this.validate(estimatedLevel);
        } else if (reproducibilityRate >= 70) {
          return this.downgrade(estimatedLevel);
        }
      }
      return this.uncertify();
    }
    if (reproducibilityRate < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED && numberOfCorrectAnswers === 2) {
      return this.downgrade(estimatedLevel);
    }
    return this.validate(estimatedLevel);
  }

  static _for2Challenges({ numberOfCorrectAnswers, numberOfNeutralizedAnswers, estimatedLevel, reproducibilityRate }) {
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

  static _for1Challenge({ numberOfCorrectAnswers, numberOfNeutralizedAnswers, estimatedLevel, reproducibilityRate }) {
    const rule = _rules.find((rule) => rule.isAppliable({
      numberOfChallengesAnswered: 1,
      numberOfCorrectAnswers,
      numberOfNeutralizedAnswers,
    }));
    if (!rule) {
      return CertifiedLevel.uncertify(); // TODO : throw ?
    } else {
      return rule.apply({ reproducibilityRate, estimatedLevel });
    }
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

class Rule {
  constructor({
    numberOfChallengesAnswered,
    numberOfCorrectAnswers,
    numberOfNeutralizedAnswers,
    actionWhenReproducibilityRateEqualOrAbove80,
    actionWhenReproducibilityBetween70And80,
    actionWhenReproducibilityBelow70,
  }) {
    this.numberOfChallengesAnswered = numberOfChallengesAnswered;
    this.numberOfCorrectAnswers = numberOfCorrectAnswers;
    this.numberOfNeutralizedAnswers = numberOfNeutralizedAnswers;
    this.actionWhenReproducibilityRateEqualOrAbove80 = actionWhenReproducibilityRateEqualOrAbove80;
    this.actionWhenReproducibilityBetween70And80 = actionWhenReproducibilityBetween70And80;
    this.actionWhenReproducibilityBelow70 = actionWhenReproducibilityBelow70;
  }
  isAppliable({
    numberOfChallengesAnswered,
    numberOfCorrectAnswers,
    numberOfNeutralizedAnswers,
  }) {
    return (numberOfChallengesAnswered === this.numberOfChallengesAnswered
    && numberOfCorrectAnswers === this.numberOfCorrectAnswers
    && numberOfNeutralizedAnswers === this.numberOfNeutralizedAnswers);
  }
  apply({ reproducibilityRate, estimatedLevel }) {
    if (reproducibilityRate >= 80) {
      return this.actionWhenReproducibilityRateEqualOrAbove80(estimatedLevel);
    } else if (reproducibilityRate >= 70) {
      return this.actionWhenReproducibilityBetween70And80(estimatedLevel);
    } else {
      return this.actionWhenReproducibilityBelow70(estimatedLevel);
    }
  }
}

class Rule17 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 1,
      numberOfCorrectAnswers: 1,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.validate,
      actionWhenReproducibilityBelow70: CertifiedLevel.downgrade,
    });
  }
}
class Rule18 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 1,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 1,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}
class Rule19 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 1,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

const _rules = [
  new Rule17(),
  new Rule18(),
  new Rule19(),
];
