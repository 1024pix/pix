export class UserMemberships {
  constructor({ userId, memberships }) {
    this.userId = userId;
    this.memberships = memberships;
  }

  isMemberOf(certificationCenterId) {
    return this.memberships.some((membership) => membership.ofCenter(certificationCenterId) && membership.isActive);
  }

  isAdminOf(certificationCenterId) {
    return this.memberships.some(
      (membership) => membership.ofCenter(certificationCenterId) && membership.isActiveAdmin,
    );
  }

  isMemberOfScoManagingStudents(certificationCenterId) {
    return this.memberships.some(
      (membership) => membership.ofScoManagingStudentCenter(certificationCenterId) && membership.isActive,
    );
  }

  isAdminOfPeer(membershipId) {
    return this.memberships.some((membership) => membership.hasPeer(membershipId) && membership.isActiveAdmin);
  }

  isAdminOfInvitation(invitationId) {
    return this.memberships.some((membership) => membership.hasInvitation(invitationId) && membership.isActiveAdmin);
  }
}

export class Membership {
  constructor({
    id,
    certificationCenterId,
    isDisabled,
    isAdmin,
    isLinkedToScoManagingStudentsOrganization,
    peerMembershipIds,
    invitationIds,
  }) {
    this.id = id;
    this.certificationCenterId = certificationCenterId;
    this.isDisabled = isDisabled;
    this.isAdmin = isAdmin;
    this.isLinkedToScoManagingStudentsOrganization = isLinkedToScoManagingStudentsOrganization;
    this.peerMembershipIds = new Set(peerMembershipIds);
    this.invitationIds = new Set(invitationIds);
  }

  get isActive() {
    return !this.isDisabled;
  }

  get isActiveAdmin() {
    return !this.isDisabled && this.isAdmin;
  }

  ofCenter(certificationCenterId) {
    return this.certificationCenterId === certificationCenterId;
  }

  ofScoManagingStudentCenter(certificationCenterId) {
    return this.certificationCenterId === certificationCenterId && this.isLinkedToScoManagingStudentsOrganization;
  }

  hasPeer(membershipId) {
    return this.peerMembershipIds.has(membershipId);
  }

  hasInvitation(invitationId) {
    return this.invitationIds.has(invitationId);
  }
}
