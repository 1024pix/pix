const _ = require('lodash');
const { status } = require('./AssessmentResult');

class CertificationAssessmentScore {
  constructor(
    {
      competenceMarks = [],
      percentageCorrectAnswers = 0,
    } = {}) {
    this.competenceMarks = competenceMarks;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
  }

  get nbPix() {
    if (_.isEmpty(this.competenceMarks)) {
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
}

module.exports = CertificationAssessmentScore;
module.exports.statuses = status;
