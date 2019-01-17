class CertificationCenterMembership {

  constructor({
    id,
    // attributes
    // includes
    certificationCenter,
    // references
    userId
  } = {}) {
    this.id = id;
    // attributes
    // references
    this.certificationCenter = certificationCenter;
    // includes
    this.userId = userId;
  }
}

module.exports = CertificationCenterMembership;
