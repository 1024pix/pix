class CertificationCourse {
  constructor(_ = {}) {
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
