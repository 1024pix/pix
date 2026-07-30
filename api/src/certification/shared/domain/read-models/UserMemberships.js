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

  isAdminOfPeer(membershipId) {
    const membershipForPeer = this.memberships.find((membership) => membership.hasPeer(membershipId));
    return membershipForPeer?.isAdmin ?? false;
  }
}

export class Membership {
  constructor({ id, certificationCenterId, isDisabled, isAdmin, peerMembershipIds }) {
    this.id = id;
    this.certificationCenterId = certificationCenterId;
    this.isDisabled = isDisabled;
    this.isAdmin = isAdmin;
    this.peerMembershipIds = peerMembershipIds;
  }

  get isActive() {
    return !this.isDisabled;
  }

  hasPeer(membershipId) {
    return this.peerMembershipIds.some((peerMembershipId) => peerMembershipId === membershipId);
  }
}
