class CertificationChallenge {
  constructor({
    id,
    // attributes
    associatedSkill,
    // includes
    // references
    challengeId,
    courseId,
    competenceId,
  } = {}) {
    this.id = id;
    // attributes
    this.associatedSkill = associatedSkill;
    // includes
    // references
    this.challengeId = challengeId;
    this.competenceId = competenceId;
    this.courseId = courseId;
  }
}

module.exports = CertificationChallenge;
