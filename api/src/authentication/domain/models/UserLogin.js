import { config } from '../../../shared/config.js';

export class UserLogin {
  /**
   * @param {object} params
   * @param {string|number} params.id
   * @param {string|number} params.userId
   * @param {number} params.failureCount
   * @param {date} params.temporaryBlockedUntil
   * @param {date} params.blockedAt
   * @param {date} params.createdAt
   * @param {date} params.updatedAt
   */
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

  /**
   * @return {boolean}
   */
  isUserMarkedAsTemporaryBlocked() {
    const now = new Date();
    return !!this.temporaryBlockedUntil && this.temporaryBlockedUntil > now;
  }

  resetUserTemporaryBlocking() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
  }

  /**
   * @return {boolean}
   */
  shouldMarkUserAsTemporarilyBlocked() {
    return this.failureCount % config.login.temporaryBlockingThresholdFailureCount === 0;
  }

  markUserAsTemporarilyBlocked() {
    const commonRatio = Math.pow(2, this.failureCount / config.login.temporaryBlockingThresholdFailureCount - 1);
    this.temporaryBlockedUntil = new Date(Date.now() + config.login.temporaryBlockingBaseTimeMs * commonRatio);
  }

  /**
   * @return {boolean}
   */
  hasFailedAtLeastOnce() {
    return this.failureCount > 0 || !!this.temporaryBlockedUntil;
  }

  /**
   * @return {boolean}
   */
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

  /**
   * @return {boolean}
   */
  isUserMarkedAsBlocked() {
    return !!this.blockedAt;
  }
}
