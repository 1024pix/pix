class CertificationChallenge {
  constructor({
    id,
    // attributes
    associatedSkillName,
    // includes
    // references
    associatedSkillId,
    challengeId,
    courseId,
    competenceId,
  } = {}) {
    this.id = id;
    // attributes
    this.associatedSkillName = associatedSkillName;
    // includes
    // references
    this.associatedSkillId = associatedSkillId;
    this.challengeId = challengeId;
    this.competenceId = competenceId;
    this.courseId = courseId;
  }
}

module.exports = CertificationChallenge;
