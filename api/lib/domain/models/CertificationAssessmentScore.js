const _ = require('lodash');
const { status } = require('./AssessmentResult');

class CertificationAssessmentScore {
  constructor({
    competenceMarks = [],
    percentageCorrectAnswers = 0,
  } = {}) {
    this.competenceMarks = competenceMarks;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
  }

  get nbPix() {
    if (this.hasNoCompetenceMarks()) {
      return 0;
    }
    return _.sumBy(this.competenceMarks, 'score');
  }

  get status() {
    if (this.nbPix === 0) {
      return status.REJECTED;
    }
    return status.VALIDATED;
  }

  getCompetenceMarks() {
    return this.competenceMarks;
  }

  getPercentageCorrectAnswers() {
    return this.percentageCorrectAnswers;
  }

  hasNoCompetenceMarks() {
    return _.isEmpty(this.competenceMarks);
  }
}

module.exports = CertificationAssessmentScore;
module.exports.statuses = status;
