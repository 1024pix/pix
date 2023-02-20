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
    this.certifiedBadgeImages = certifiedBadgeImages;
    this.resultCompetenceTree = resultCompetenceTree;
    this.maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
  }

  setResultCompetenceTree(resultCompetenceTree) {
    this.resultCompetenceTree = resultCompetenceTree;
  }
}

export default ShareableCertificate;
