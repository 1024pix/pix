class CertificationCourse {
  constructor({
    _id,
    // attributes
    // embedded
    // relations
  } = {}) {
    // attributes
    // embedded
    // relations
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
