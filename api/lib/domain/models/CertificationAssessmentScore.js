const _ = require('lodash');
const { UNCERTIFIED_LEVEL } = require('../constants');
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

  get level() {
    if (this.nbPix === 0) {
      return UNCERTIFIED_LEVEL;
    }
    return null;
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
