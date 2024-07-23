import { config } from '../../../shared/config.js';

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

  isUserMarkedAsTemporaryBlocked() {
    const now = new Date();
    return !!this.temporaryBlockedUntil && this.temporaryBlockedUntil > now;
  }

  resetUserTemporaryBlocking() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
  }

  shouldMarkUserAsTemporarilyBlocked() {
    return this.failureCount % config.login.temporaryBlockingThresholdFailureCount === 0;
  }

  markUserAsTemporarilyBlocked() {
    const commonRatio = Math.pow(2, this.failureCount / config.login.temporaryBlockingThresholdFailureCount - 1);
    this.temporaryBlockedUntil = new Date(Date.now() + config.login.temporaryBlockingBaseTimeMs * commonRatio);
  }

  hasFailedAtLeastOnce() {
    return this.failureCount > 0 || !!this.temporaryBlockedUntil;
  }

  shouldMarkUserAsBlocked() {
    return this.failureCount >= config.login.blockingLimitFailureCount;
  }

  markUserAsBlocked() {
    this.blockedAt = new Date();
  }

  resetUserBlocking() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
    this.blockedAt = null;
  }

  isUserMarkedAsBlocked() {
    return !!this.blockedAt;
  }

  anonymize() {
    return new UserLogin({
      ...this,
      temporaryBlockedUntil: null,
      blockedAt: null,
    });
  }
}

export { UserLogin };
