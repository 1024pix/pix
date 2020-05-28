class Certification {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    isPublished,
    userId,
    date,
    certificationCenter,
    pixScore,
    status,
    commentForCandidate,
    acquiredPartnerCertifications = [],
    resultCompetenceTree = null,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.isPublished = isPublished;
    this.userId = userId;
    this.date = date;
    this.certificationCenter = certificationCenter;
    this.pixScore = pixScore;
    this.status = status;
    this.commentForCandidate = commentForCandidate;
    this.acquiredPartnerCertifications = acquiredPartnerCertifications;
    this.resultCompetenceTree = resultCompetenceTree;
  }
}

module.exports = Certification;
