class CertificationChallenge {
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
    const certificationChallenge = new CertificationChallenge();
    return Object.assign(certificationChallenge, attributes);
  }
}

module.exports = CertificationChallenge;
