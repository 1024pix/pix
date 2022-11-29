const dayjs = require('dayjs');
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

  blockUserTemporarilyWhenFailureCountThresholdReached() {
    const isThresholdReached = this.failureCount % settings.userLogins.thresholdFailureCount === 0;
    if (isThresholdReached) {
      const rest = this.failureCount / settings.userLogins.thresholdFailureCount;
      this.temporaryBlockedUntil = dayjs()
        .add(Math.pow(settings.userLogins.temporaryBlockedTime, rest), 'minute')
        .toDate();
    }
  }

  hasBeenTemporaryBlocked() {
    return this.failureCount > 0 || !!this.temporaryBlockedUntil;
  }

  isUserBlocked() {
    return !!this.blockedAt || this.failureCount >= settings.userLogins.limitFailureCount;
  }
}

module.exports = UserLogin;
