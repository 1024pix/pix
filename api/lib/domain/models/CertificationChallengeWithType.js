import { Type } from '../../../src/shared/domain/models/Challenge.js';

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
