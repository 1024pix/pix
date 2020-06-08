const moment = require('moment');
const _ = require('lodash');
const Badge = require('./Badge');
const CleaCertification = require('./CleaCertification');

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
    deliveredAt,
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
    // includes
    this.resultCompetenceTree = resultCompetenceTree;
    // references
    this.userId = userId;
    this.acquiredPartnerCertifications = acquiredPartnerCertifications;
  }

  get cleaCertificationStatus() {
    const cleaCertification =
      _.find(this.acquiredPartnerCertifications, { partnerKey: Badge.keys.PIX_EMPLOI_CLEA });

    return CleaCertification.certificationStatus(cleaCertification);
  }
}

module.exports = Certification;
