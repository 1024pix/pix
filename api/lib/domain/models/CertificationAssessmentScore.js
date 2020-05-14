class CertificationAssessmentScore {
  constructor(
    {
      // attributes
      level = null,
      nbPix = null,
      validatedSkills = [],
      failedSkills = [],
      competenceMarks = [],
      percentageCorrectAnswers = 0,
      // includes
      // references
    } = {}) {
    // attributes
    this.level = level;
    this.nbPix = nbPix;
    this.validatedSkills = validatedSkills;
    this.failedSkills = failedSkills;
    this.competenceMarks = competenceMarks;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
  }
}

module.exports = CertificationAssessmentScore;
