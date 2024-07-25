import { Type } from './Challenge.js';

class CertificationChallengeWithType {
  constructor({
    id,
    associatedSkillName,
    challengeId,
    type,
    competenceId,
    isNeutralized,
    hasBeenSkippedAutomatically,
    certifiableBadgeKey,
    createdAt,
  } = {}) {
    this.id = id;
    this.associatedSkillName = associatedSkillName;
    this.challengeId = challengeId;
    const possibleTypeValues = Object.values(Type);
    this.type = possibleTypeValues.includes(type) ? type : 'EmptyType';
    this.competenceId = competenceId;
    this.isNeutralized = isNeutralized;
    this.hasBeenSkippedAutomatically = hasBeenSkippedAutomatically;
    this.certifiableBadgeKey = certifiableBadgeKey;
    this.createdAt = createdAt;
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

  skipAutomatically() {
    this.hasBeenSkippedAutomatically = true;
  }
}

export { CertificationChallengeWithType };
