const moment = require('moment');
const _ = require('lodash');

class Certification {

  constructor({
    id,
    // attributes
    assessmentState,
    birthdate,
    birthplace,
    certificationCenter,
    date,
    firstName,
    isPublished,
    lastName,
    // includes
    assessmentResults = [],
    acquiredPartnerCertifications = [],
    resultCompetenceTree,
    // references
    userId,
  } = {}) {
    this.id = id;
    // attributes
    this.assessmentState = assessmentState;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.firstName = firstName;
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
    // includes
    this.resultCompetenceTree = resultCompetenceTree;
    // references
    this.userId = userId;
    this.acquiredPartnerCertifications = acquiredPartnerCertifications;

  }
}

module.exports = Certification;
