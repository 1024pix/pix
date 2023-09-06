class CertificationCenterMembership {
  constructor({ id, certificationCenter, user, createdAt, disabledAt, isReferer, role } = {}) {
    this.id = id;
    this.certificationCenter = certificationCenter;
    this.user = user;
    this.createdAt = createdAt;
    this.disabledAt = disabledAt;
    this.isReferer = isReferer;
    this.role = role;
  }
}

export { CertificationCenterMembership };
