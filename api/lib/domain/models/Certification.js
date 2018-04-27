const moment = require('moment');

function _byDate(assessmentResultA, assessmentResultB) {
  return moment(assessmentResultA.createdAt) < moment(assessmentResultB.createdAt);
}

class Certification {

  constructor({ id, date, certificationCenter, isPublished, assessmentResults = [] } = {}) {
    this.id = id;
    this.date = date;
    this.certificationCenter = certificationCenter;
    this.isPublished = isPublished;

    const assessmentResultsCopy = Array.from(assessmentResults);
    const mostRecentAssessment = assessmentResultsCopy.sort(_byDate)[0];

    if (typeof mostRecentAssessment !== 'undefined') {
      this.pixScore = mostRecentAssessment.pixScore;
      this.status = mostRecentAssessment.status;
    }
  }
}

module.exports = Certification;
