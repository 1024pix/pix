class CertificationChallenge {
  constructor(_ = {}) {
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
