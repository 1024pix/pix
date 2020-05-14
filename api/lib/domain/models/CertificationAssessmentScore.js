const _ = require('lodash');

class CertificationAssessmentScore {
  constructor(
    {
      level = null, // TODO useless now, delete everywhere !
      competenceMarks = [],
      percentageCorrectAnswers = 0,
    } = {}) {
    this.level = level;
    this.competenceMarks = competenceMarks;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
  }

  get nbPix() {
    if (_.isEmpty(this.competenceMarks)) {
      return 0;
    }
    return _.sumBy(this.competenceMarks, 'score');
  }
}

module.exports = CertificationAssessmentScore;
