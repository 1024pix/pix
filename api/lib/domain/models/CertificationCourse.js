class CertificationCourse {
  constructor(
    {
      id,
      // attributes
      birthplace,
      birthdate,
      completedAt,
      createdAt,
      updatedAt,
      externalId,
      firstName,
      isPublished = false,
      lastName,
      nbChallenges,
      isV2Certification = false,
      // includes
      // references
      userId,
      sessionId,
    } = {}) {
    this.id = id;
    // attributes
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.completedAt = completedAt;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
    this.externalId = externalId;
    this.firstName = firstName;
    this.isPublished = isPublished;
    this.lastName = lastName;
    this.nbChallenges = nbChallenges;
    this.isV2Certification = isV2Certification;
    // includes
    // references
    this.userId = userId;
    this.sessionId = sessionId;
  }

  /**
   * @deprecated
   */
  static fromAttributes(attributes) {
    const certificationCourse = new CertificationCourse();
    return Object.assign(certificationCourse, attributes);
  }
}

module.exports = CertificationCourse;
