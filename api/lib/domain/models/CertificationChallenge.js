class CertificationChallenge {
  constructor({
    id,
    associatedSkillName,
    associatedSkillId,
    challengeId,
    courseId,
    competenceId,
    isNeutralized,
    certifiableBadgeKey,
    difficulty,
    discriminant,
  } = {}) {
    this.id = id;
    this.associatedSkillName = associatedSkillName;
    this.associatedSkillId = associatedSkillId;
    this.challengeId = challengeId;
    this.competenceId = competenceId;
    this.courseId = courseId;
    this.isNeutralized = isNeutralized;
    this.certifiableBadgeKey = certifiableBadgeKey;
    this.difficulty = difficulty;
    this.discriminant = discriminant;
  }

  static createForPixCertification({ associatedSkillName, associatedSkillId, challengeId, competenceId }) {
    return new CertificationChallenge({
      id: undefined,
      courseId: undefined,
      associatedSkillName,
      associatedSkillId,
      challengeId,
      competenceId,
      isNeutralized: false,
      certifiableBadgeKey: null,
    });
  }

  static createForPixPlusCertification({
    associatedSkillName,
    associatedSkillId,
    challengeId,
    competenceId,
    certifiableBadgeKey,
  }) {
    return new CertificationChallenge({
      id: undefined,
      courseId: undefined,
      associatedSkillName,
      associatedSkillId,
      challengeId,
      competenceId,
      isNeutralized: false,
      certifiableBadgeKey,
    });
  }
}

export { CertificationChallenge };
