const settings = require('../../config');

class UserLogin {
  constructor({ id, userId, failureCount = 0, temporaryBlockedUntil, blockedAt, createdAt, updatedAt } = {}) {
    this.id = id;
    this.userId = userId;
    this.failureCount = failureCount;
    this.temporaryBlockedUntil = temporaryBlockedUntil;
    this.blockedAt = blockedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  incrementFailureCount() {
    this.failureCount++;
  }

  isUserTemporaryBlocked() {
    const now = new Date();
    return !!this.temporaryBlockedUntil && this.temporaryBlockedUntil > now;
  }

  resetUserTemporaryBlocking() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
  }

  shouldBlockUserTemporarily() {
    return this.failureCount % settings.login.temporaryBlockingThresholdFailureCount === 0;
  }

  blockUserTemporarily() {
    const commonRatio = Math.pow(2, this.failureCount / settings.login.temporaryBlockingThresholdFailureCount - 1);
    this.temporaryBlockedUntil = new Date(Date.now() + settings.login.temporaryBlockingBaseTimeMs * commonRatio);
  }

  hasBeenTemporaryBlocked() {
    return this.failureCount > 0 || !!this.temporaryBlockedUntil;
  }

  shouldBlockUser() {
    return this.failureCount >= settings.login.blockingLimitFailureCount;
  }

  blockUser() {
    this.blockedAt = new Date();
  }

  unblockUser() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
    this.blockedAt = null;
  }

  isUserBlocked() {
    return !!this.blockedAt;
  }
}

module.exports = UserLogin;
