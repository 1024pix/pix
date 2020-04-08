class CertificationChallenge {
  constructor({
    id,
    // attributes
    associatedSkill,
    // includes
    // references
    associatedSkillId,
    challengeId,
    courseId,
    competenceId,
  } = {}) {
    this.id = id;
    // attributes
    this.associatedSkill = associatedSkill;
    // includes
    // references
    this.associatedSkillId = associatedSkillId;
    this.challengeId = challengeId;
    this.competenceId = competenceId;
    this.courseId = courseId;
  }
}

module.exports = CertificationChallenge;
