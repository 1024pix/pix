export class UserMemberships {
  constructor({ userId, memberships }) {
    this.userId = userId;
    this.memberships = memberships;
  }
}

export class Membership {
  constructor({ certificationCenterId, isDisabled }) {
    this.certificationCenterId = certificationCenterId;
    this.isDisabled = isDisabled;
  }
}
