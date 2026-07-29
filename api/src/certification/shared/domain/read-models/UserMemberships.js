export class UserMemberships {
  constructor({ userId, memberships }) {
    this.userId = userId;
    this.memberships = memberships;
  }

  isMemberOf(certificationCenterId) {
    return this.memberships.some(
      (membership) => membership.certificationCenterId === certificationCenterId && membership.isActive,
    );
  }
}

export class Membership {
  constructor({ certificationCenterId, isDisabled }) {
    this.certificationCenterId = certificationCenterId;
    this.isDisabled = isDisabled;
  }

  get isActive() {
    return !this.isDisabled;
  }
}
