class CertificationCenterInvitedUser {
  constructor({ userId, invitation, status } = {}) {
    this.userId = userId;
    this.invitation = invitation;
    this.status = status;
  }
}

module.exports = CertificationCenterInvitedUser;
