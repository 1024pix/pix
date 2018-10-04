class CertificationCourse {
  constructor(
    {
      id,
      // attributes
      birthplace,
      birthdate,
      completedAt,
      createdAt,
      externalId,
      firstName,
      isPublished,
      lastName,
      nbChallenges,
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
    this.createdAt = createdAt;
    this.externalId = externalId;
    this.firstName = firstName;
    this.isPublished = isPublished;
    this.lastName = lastName;
    this.nbChallenges = nbChallenges;
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
