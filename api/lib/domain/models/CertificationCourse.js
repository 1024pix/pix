class CertificationCourse {
  constructor({
    _id,
    // attributes
    // includes
    // references
  } = {}) {
    // attributes
    // includes
    // references
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
