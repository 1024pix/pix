export class CertificationChallenge {
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
    createdAt,
  }) {
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
    this.createdAt = createdAt;
  }
}
