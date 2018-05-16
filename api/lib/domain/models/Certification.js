const moment = require('moment');

function _byDate(assessmentResultA, assessmentResultB) {
  return moment(assessmentResultA.createdAt) < moment(assessmentResultB.createdAt);
}

class Certification {

  constructor({ id, assessmentState, assessmentResults = [], certificationCenter, date, isPublished, userId } = {}) {
    this.id = id;
    this.assessmentState = assessmentState;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.isPublished = isPublished;
    this.userId = userId;

    const assessmentResultsCopy = Array.from(assessmentResults);
    const mostRecentAssessmentResult = assessmentResultsCopy.sort(_byDate)[0];

    if (mostRecentAssessmentResult) {
      this.pixScore = mostRecentAssessmentResult.pixScore;
      this.status = mostRecentAssessmentResult.status;
      this.commentForCandidate = mostRecentAssessmentResult.commentForCandidate;
    }
  }
}

module.exports = Certification;
