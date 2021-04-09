const {
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
    const rule = _rules.findRuleFor({
      numberOfChallengesAnswered,
      numberOfCorrectAnswers,
      numberOfNeutralizedAnswers,
    });
    if (!rule) {
      throw new Error('Règle de calcul de niveau certifié manquante.');
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

  isApplicable({
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

class Rule1 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 3,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.validate,
      actionWhenReproducibilityBelow70: CertifiedLevel.validate,
    });
  }
}

class Rule2 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 2,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.downgrade,
      actionWhenReproducibilityBelow70: CertifiedLevel.downgrade,
    });
  }
}

class Rule3 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 2,
      numberOfNeutralizedAnswers: 1,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.validate,
      actionWhenReproducibilityBelow70: CertifiedLevel.validate,
    });
  }
}

class Rule4 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 1,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule5 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 1,
      numberOfNeutralizedAnswers: 1,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.downgrade,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule6 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 1,
      numberOfNeutralizedAnswers: 2,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.validate,
      actionWhenReproducibilityBelow70: CertifiedLevel.downgrade,
    });
  }
}

class Rule7 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule8 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 1,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule9 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 2,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule10 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 3,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 3,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule11 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 2,
      numberOfCorrectAnswers: 2,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.validate,
      actionWhenReproducibilityBelow70: CertifiedLevel.validate,
    });
  }
}

class Rule12 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 2,
      numberOfCorrectAnswers: 1,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.downgrade,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule13 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 2,
      numberOfCorrectAnswers: 1,
      numberOfNeutralizedAnswers: 1,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.validate,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.validate,
      actionWhenReproducibilityBelow70: CertifiedLevel.downgrade,
    });
  }
}

class Rule14 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 2,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 0,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule15 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 2,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 1,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
  }
}

class Rule16 extends Rule {
  constructor() {
    super({
      numberOfChallengesAnswered: 2,
      numberOfCorrectAnswers: 0,
      numberOfNeutralizedAnswers: 2,
      actionWhenReproducibilityRateEqualOrAbove80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBetween70And80: CertifiedLevel.uncertify,
      actionWhenReproducibilityBelow70: CertifiedLevel.uncertify,
    });
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

const _rules = {
  rules: [
    new Rule1(),
    new Rule2(),
    new Rule3(),
    new Rule4(),
    new Rule5(),
    new Rule6(),
    new Rule7(),
    new Rule8(),
    new Rule9(),
    new Rule10(),
    new Rule11(),
    new Rule12(),
    new Rule13(),
    new Rule14(),
    new Rule15(),
    new Rule16(),
    new Rule17(),
    new Rule18(),
    new Rule19(),
  ],
  findRuleFor({
    numberOfChallengesAnswered,
    numberOfCorrectAnswers,
    numberOfNeutralizedAnswers,
  }) {
    return this.rules.find((rule) => rule.isApplicable({
      numberOfChallengesAnswered,
      numberOfCorrectAnswers,
      numberOfNeutralizedAnswers,
    }));
  },
};
