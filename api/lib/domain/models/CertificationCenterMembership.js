const CERTIFICATION_CENTER_MEMBERSHIP_ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

class CertificationCenterMembership {
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
    return this.role === CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN;
  }

  get hasMemberRole() {
    return this.role === CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER;
  }

  updateRole({ role, updatedByUserId }) {
    this.role = role;
    this.updatedByUserId = updatedByUserId;
    this.updatedAt = new Date();
  }
}

export { CertificationCenterMembership, CERTIFICATION_CENTER_MEMBERSHIP_ROLES };
