const moment = require('moment');

function _byDate(assessmentResultA, assessmentResultB) {
  return moment(assessmentResultA.createdAt) < moment(assessmentResultB.createdAt);
}

class Certification {

  constructor({
    id,
    assessmentState,
    assessmentResults = [],
    birthdate,
    certificationCenter,
    date,
    firstName,
    isPublished,
    lastName,
    userId,
    certifiedProfile = null,
  } = {}) {
    this.id = id;
    this.assessmentState = assessmentState;
    this.birthdate = birthdate;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.firstName = firstName;
    this.isPublished = isPublished;
    this.lastName = lastName;
    this.userId = userId;
    this.certifiedProfile = certifiedProfile;

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
