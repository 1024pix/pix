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
      isPublished = false,
      lastName,
      isV2Certification = false,
      // includes
      assessment,
      challenges,
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
    this.isV2Certification = isV2Certification;
    // includes
    this.assessment = assessment;
    this.challenges = challenges;
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
