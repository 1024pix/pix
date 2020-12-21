class CertificationChallenge {
  constructor({
    id,
    associatedSkillName,
    associatedSkillId,
    challengeId,
    courseId,
    competenceId,
  } = {}) {
    this.id = id;
    this.associatedSkillName = associatedSkillName;
    this.associatedSkillId = associatedSkillId;
    this.challengeId = challengeId;
    this.competenceId = competenceId;
    this.courseId = courseId;
  }
}

module.exports = CertificationChallenge;
