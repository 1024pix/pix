import { Type } from '../../../../shared/domain/models/Challenge.js';

export class CertificationChallengeWithType {
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

  skipAutomatically() {
    this.hasBeenSkippedAutomatically = true;
  }
}
