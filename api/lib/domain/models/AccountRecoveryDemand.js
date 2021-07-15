class AccountRecoveryDemand {

  constructor({
    id,
    userId,
    schoolRegistrationId,
    oldEmail,
    newEmail,
    temporaryKey,
    used,
  } = {}) {
    this.id = id;
    this.schoolRegistrationId = schoolRegistrationId;
    this.userId = userId;
    this.oldEmail = oldEmail;
    this.newEmail = newEmail;
    this.temporaryKey = temporaryKey;
    this.used = used;
  }
}

module.exports = AccountRecoveryDemand;
