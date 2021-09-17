const { Type } = require('./Challenge');

class CertificationChallengeWithType {
  constructor({
    id,
    associatedSkillName,
    challengeId,
    type,
    competenceId,
    isNeutralized,
    isSkipped,
    certifiableBadgeKey,
  } = {}) {
    this.id = id;
    this.associatedSkillName = associatedSkillName;
    this.challengeId = challengeId;
    const possibleTypeValues = Object.values(Type);
    this.type = possibleTypeValues.includes(type)
      ? type
      : 'EmptyType';
    this.competenceId = competenceId;
    this.isNeutralized = isNeutralized;
    this.isSkipped = isSkipped;
    this.certifiableBadgeKey = certifiableBadgeKey;
  }

  neutralize() {
    this.isNeutralized = true;
  }

  deneutralize() {
    this.isNeutralized = false;
  }

  isPixPlus() {
    return Boolean(this.certifiableBadgeKey);
  }

  skip() {
    this.isSkipped = true;
  }
}

module.exports = CertificationChallengeWithType;
