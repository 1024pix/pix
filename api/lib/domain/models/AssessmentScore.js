class AssessmentScore {
  constructor(
    {
      // attributes
      level = 0,
      nbPix = 0,
      successRate = 0,
      validatedSkills = [],
      failedSkills = [],
      competenceMarks = [],
      // includes
      // references
    } = {}) {
    // attributes
    this.level = level;
    this.nbPix = nbPix;
    this.successRate = successRate;
    this.validatedSkills = validatedSkills;
    this.failedSkills = failedSkills;
    this.competenceMarks = competenceMarks;
  }
}

module.exports = AssessmentScore;
