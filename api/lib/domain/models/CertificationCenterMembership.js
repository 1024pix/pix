class CertificationCenterMembership {

  constructor({
    id,
    // attributes
    // includes
    certificationCenter,
  } = {}) {
    this.id = id;
    // attributes
    // references
    this.certificationCenter = certificationCenter;
  }
}

module.exports = CertificationCenterMembership;
