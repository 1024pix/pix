class CertificationCenterMembership {

  constructor({
    id,
    certificationCenter,
    user,
    createdAt,
  } = {}) {
    this.id = id;
    this.certificationCenter = certificationCenter;
    this.user = user;
    this.createdAt = createdAt;
  }
}

module.exports = CertificationCenterMembership;
