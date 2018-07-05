class CertificationChallenge {
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
    const certificationChallenge = new CertificationChallenge();
    return Object.assign(certificationChallenge, attributes);
  }
}

module.exports = CertificationChallenge;
