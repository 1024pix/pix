const moment = require('moment');

function _byDate(assessmentResultA, assessmentResultB) {
  return moment(assessmentResultA.createdAt) < moment(assessmentResultB.createdAt);
}

class Certification {

  constructor({
    id,
    // attributes
    assessmentState,
    birthdate,
    certificationCenter,
    date,
    firstName,
    isPublished,
    lastName,
    // includes
    assessmentResults = [],
    resultCompetenceTree,
    // references
    userId,
  } = {}) {
    this.id = id;
    // attributes
    this.assessmentState = assessmentState;
    this.birthdate = birthdate;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.firstName = firstName;
    this.isPublished = isPublished;
    this.lastName = lastName;
    const assessmentResultsCopy = Array.from(assessmentResults);
    const mostRecentAssessmentResult = assessmentResultsCopy.sort(_byDate)[0];

    if (mostRecentAssessmentResult) {
      this.pixScore = mostRecentAssessmentResult.pixScore;
      this.status = mostRecentAssessmentResult.status;
      this.commentForCandidate = mostRecentAssessmentResult.commentForCandidate;
    }
    // includes
    this.resultCompetenceTree = resultCompetenceTree;
    // references
    this.userId = userId;

  }
}

module.exports = Certification;
