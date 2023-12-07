const CERTIFICATION_CENTER_MEMBER_ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

class CertificationCenterMember {
  constructor({
    id,
    certificationCenter,
    user,
    createdAt,
    disabledAt,
    isReferer,
    role,
    updatedByUserId,
    updatedAt,
  } = {}) {
    this.id = id;
    this.certificationCenter = certificationCenter;
    this.user = user;
    this.createdAt = createdAt;
    this.disabledAt = disabledAt;
    this.isReferer = isReferer;
    this.role = role;
    this.updatedByUserId = updatedByUserId;
    this.updatedAt = updatedAt;
  }

  get hasAdminRole() {
    return this.role === CERTIFICATION_CENTER_MEMBER_ROLES.ADMIN;
  }

  updateRole({ role, updatedByUserId }) {
    this.role = role;
    this.updatedAt = new Date();

    if (updatedByUserId) {
      this.updatedByUserId = updatedByUserId;
    }
  }
}

export { CertificationCenterMember, CERTIFICATION_CENTER_MEMBER_ROLES };
