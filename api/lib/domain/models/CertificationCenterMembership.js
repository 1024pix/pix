class CertificationCenterMembership {
  constructor({ id, certificationCenter, user, createdAt, disabledAt } = {}) {
    this.id = id;
    this.certificationCenter = certificationCenter;
    this.user = user;
    this.createdAt = createdAt;
    this.disabledAt = disabledAt;
  }
}

module.exports = CertificationCenterMembership;
