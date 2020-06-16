const moment = require('moment');
const _ = require('lodash');

class Certification {

  constructor({
    id,
    // attributes
    birthdate,
    birthplace,
    certificationCenter,
    date,
    firstName,
    deliveredAt,
    isPublished,
    lastName,
    cleaCertificationStatus,
    // includes
    assessmentResults = [],
    resultCompetenceTree,
    // references
    userId,
  } = {}) {
    this.id = id;
    // attributes
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.firstName = firstName;
    this.deliveredAt = deliveredAt;
    this.isPublished = isPublished;
    this.lastName = lastName;
    const assessmentResultsCopy = Array.from(assessmentResults);
    const mostRecentAssessmentResult = _.maxBy(assessmentResultsCopy, (assessmentResult) => {
      return moment(assessmentResult.createdAt);
    });

    if (mostRecentAssessmentResult) {
      this.pixScore = mostRecentAssessmentResult.pixScore;
      this.status = mostRecentAssessmentResult.status;
      this.commentForCandidate = mostRecentAssessmentResult.commentForCandidate;
    }
    this.cleaCertificationStatus = cleaCertificationStatus;
    // includes
    this.resultCompetenceTree = resultCompetenceTree;
    // references
    this.userId = userId;
  }
}

module.exports = Certification;
