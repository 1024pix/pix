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

  isAdminOf(certificationCenterId) {
    return this.memberships.some(
      (membership) => membership.certificationCenterId === certificationCenterId && membership.isActiveAdmin,
    );
  }

  isAdminOfPeer(membershipId) {
    const membershipForPeer = this.memberships.find((membership) => membership.hasPeer(membershipId));
    return membershipForPeer?.isActiveAdmin ?? false;
  }

  isAdminOfInvitation(invitationId) {
    const membershipForInvitation = this.memberships.find((membership) => membership.hasInvitation(invitationId));
    return membershipForInvitation?.isActiveAdmin ?? false;
  }
}

export class Membership {
  constructor({ id, certificationCenterId, isDisabled, isAdmin, peerMembershipIds, invitationIds }) {
    this.id = id;
    this.certificationCenterId = certificationCenterId;
    this.isDisabled = isDisabled;
    this.isAdmin = isAdmin;
    this.peerMembershipIds = new Set(peerMembershipIds);
    this.invitationIds = new Set(invitationIds);
  }

  get isActive() {
    return !this.isDisabled;
  }

  get isActiveAdmin() {
    return !this.isDisabled && this.isAdmin;
  }

  hasPeer(membershipId) {
    return this.peerMembershipIds.has(membershipId);
  }

  hasInvitation(invitationId) {
    return this.invitationIds.has(invitationId);
  }
}
