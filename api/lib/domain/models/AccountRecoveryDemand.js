class AccountRecoveryDemand {
  constructor({ id, userId, schoolingRegistrationId, oldEmail, newEmail, temporaryKey, used, createdAt } = {}) {
    this.id = id;
    this.schoolingRegistrationId = schoolingRegistrationId;
    this.userId = userId;
    this.oldEmail = oldEmail;
    this.newEmail = newEmail.toLowerCase();
    this.temporaryKey = temporaryKey;
    this.used = used;
    this.createdAt = createdAt;
  }
}

module.exports = AccountRecoveryDemand;
