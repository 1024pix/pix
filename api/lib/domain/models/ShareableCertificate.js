class ShareableCertificate {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    isPublished,
    userId,
    date,
    deliveredAt,
    certificationCenter,
    pixScore,
    cleaCertificationResult,
    certifiedBadgeImages,
    resultCompetenceTree = null,
    maxReachableLevelOnCertificationDate,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.isPublished = isPublished;
    this.userId = userId;
    this.date = date;
    this.deliveredAt = deliveredAt;
    this.certificationCenter = certificationCenter;
    this.pixScore = pixScore;
    this.cleaCertificationResult = cleaCertificationResult;
    this.certifiedBadgeImages = certifiedBadgeImages;
    this.resultCompetenceTree = resultCompetenceTree;
    this.maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
  }

  setResultCompetenceTree(resultCompetenceTree) {
    this.resultCompetenceTree = resultCompetenceTree;
  }
}

module.exports = ShareableCertificate;
