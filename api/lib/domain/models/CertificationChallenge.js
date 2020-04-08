class CertificationChallenge {
  constructor({
    id,
    // attributes
    associatedSkill,
    // includes
    // references
    challengeId,
    certificationCourseId,
    competenceId,
  } = {}) {
    this.id = id;
    // attributes
    this.associatedSkill = associatedSkill;
    // includes
    // references
    this.challengeId = challengeId;
    this.competenceId = competenceId;
    this.certificationCourseId = certificationCourseId;
  }
}

module.exports = CertificationChallenge;
