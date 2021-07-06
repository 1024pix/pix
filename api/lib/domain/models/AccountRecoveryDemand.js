class AccountRecoveryDemand {

  constructor({
    id,
    userId,
    oldEmail,
    newEmail,
    temporaryKey,
    used,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.oldEmail = oldEmail;
    this.newEmail = newEmail;
    this.temporaryKey = temporaryKey;
    this.used = used;
  }
}

module.exports = AccountRecoveryDemand;
