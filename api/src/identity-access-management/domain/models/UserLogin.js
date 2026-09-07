import { config } from '../../../../config/config.js';
import { anonymizeGeneralizeDate } from '../../../shared/infrastructure/utils/date-utils.js';

class UserLogin {
  constructor({
    id,
    userId,
    failureCount = 0,
    temporaryBlockedUntil,
    blockedAt,
    createdAt,
    updatedAt,
    lastLoggedAt,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.failureCount = failureCount;
    this.temporaryBlockedUntil = temporaryBlockedUntil;
    this.blockedAt = blockedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.lastLoggedAt = lastLoggedAt;
  }

  get remainingAttempts() {
    if (this.failureCount > config.login.blockingLimitFailureCount) {
      return 0;
    }

    return config.login.blockingLimitFailureCount - this.failureCount;
  }

  get shouldWarnRemainingAttempts() {
    const warningThreshold = config.login.temporaryBlockingThresholdFailureCount;
    return this.remainingAttempts > 0 && this.remainingAttempts <= warningThreshold;
  }

  incrementFailureCount() {
    this.failureCount++;
  }

  computeBlockingDurationMs() {
    const commonRatio = Math.pow(2, this.failureCount / config.login.temporaryBlockingThresholdFailureCount - 1);
    return config.login.temporaryBlockingBaseTimeMs * commonRatio;
  }

  hasFailedAtLeastOnce() {
    return this.failureCount > 0 || Boolean(this.temporaryBlockedUntil);
  }

  shouldMarkUserAsTemporarilyBlocked() {
    return this.failureCount % config.login.temporaryBlockingThresholdFailureCount === 0;
  }

  shouldSendConnectionWarning() {
    if (!this.lastLoggedAt) {
      return false;
    }

    const emailConnectionWarningPeriodMs = config.login.emailConnectionWarningPeriod;
    const nowMs = new Date().getTime();

    const userLastConnexionMs = new Date(this.lastLoggedAt).getTime();
    return nowMs - userLastConnexionMs >= emailConnectionWarningPeriodMs;
  }

  markUserAsTemporarilyBlocked() {
    this.temporaryBlockedUntil = new Date(Date.now() + this.computeBlockingDurationMs());
  }

  isUserMarkedAsTemporaryBlocked() {
    const now = new Date();
    return this?.temporaryBlockedUntil > now;
  }

  resetUserTemporaryBlocking() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
  }

  shouldMarkUserAsBlocked() {
    return this.failureCount >= config.login.blockingLimitFailureCount;
  }

  markUserAsBlocked() {
    this.blockedAt = new Date();
    this.temporaryBlockedUntil = null;
  }

  isUserMarkedAsBlocked() {
    return Boolean(this.blockedAt);
  }

  resetUserBlocking() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
    this.blockedAt = null;
  }

  anonymize() {
    return new UserLogin({
      ...this,
      createdAt: anonymizeGeneralizeDate(this.createdAt),
      updatedAt: anonymizeGeneralizeDate(this.updatedAt),
      temporaryBlockedUntil: null,
      blockedAt: null,
      lastLoggedAt: this.lastLoggedAt && anonymizeGeneralizeDate(this.lastLoggedAt),
    });
  }
}

export { UserLogin };
