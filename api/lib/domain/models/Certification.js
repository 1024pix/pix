const moment = require('moment');

function _byDate(assessmentResultA, assessmentResultB) {
  return moment(assessmentResultA.createdAt) < moment(assessmentResultB.createdAt);
}

class Certification {

  constructor({ id, date, certificationCenter, isPublished, assessmentState, assessmentResults = [] } = {}) {
    this.id = id;
    this.date = date;
    this.certificationCenter = certificationCenter;
    this.isPublished = isPublished;
    this.assessmentState = assessmentState;

    const assessmentResultsCopy = Array.from(assessmentResults);
    const mostRecentAssessment = assessmentResultsCopy.sort(_byDate)[0];

    if (mostRecentAssessment) {
      this.pixScore = mostRecentAssessment.pixScore;
      this.status = mostRecentAssessment.status;
    }
  }
}

module.exports = Certification;
