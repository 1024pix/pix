class CertificationAssessmentScore {
  constructor(
    {
      level = null,
      nbPix = null,
      competenceMarks = [],
      percentageCorrectAnswers = 0,
    } = {}) {
    this.level = level;
    this.nbPix = nbPix;
    this.competenceMarks = competenceMarks;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
  }
}

module.exports = CertificationAssessmentScore;
